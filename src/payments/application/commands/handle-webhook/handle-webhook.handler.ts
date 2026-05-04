import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { HandleWebhookCommand } from './handle-webhook.command';
import {
  PAYMENT_PROVIDER_PORT,
  IPaymentProviderPort,
  WebhookPayload,
} from '../../../domain/payment-provider.port';
import { PaymentStatus } from '../../../domain/payment.types';
import { Payment } from '../../../payment.entity';
import { User } from '@/users/user.entity';

@CommandHandler(HandleWebhookCommand)
@Injectable()
export class HandleWebhookHandler implements ICommandHandler<HandleWebhookCommand> {
  private readonly logger = new Logger(HandleWebhookHandler.name);

  // Replay-protection window for webhook freshness.
  private static readonly MAX_AGE_MS = 5 * 60 * 1000;
  private static readonly MAX_FUTURE_SKEW_MS = 60 * 1000;

  constructor(
    @Inject(PAYMENT_PROVIDER_PORT)
    private readonly paymentProvider: IPaymentProviderPort,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: HandleWebhookCommand): Promise<void> {
    const { rawBody, signature, body } = command;

    const isValid = await this.paymentProvider.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const webhook = this.paymentProvider.parseWebhookBody(body);
    this.assertFresh(webhook.modifiedAt, webhook.invoiceId);

    if (webhook.status === PaymentStatus.SUCCESS) {
      await this.applySuccess(webhook, body);
    } else {
      await this.applyNonTerminalUpdate(webhook, body);
    }
  }

  private assertFresh(modifiedAt: Date, invoiceId: string): void {
    const ageMs = Date.now() - modifiedAt.getTime();
    if (ageMs > HandleWebhookHandler.MAX_AGE_MS) {
      this.logger.warn(
        `Webhook for invoiceId=${invoiceId} rejected: too old (${ageMs}ms)`,
      );
      throw new BadRequestException('Webhook is outside the freshness window');
    }
    if (ageMs < -HandleWebhookHandler.MAX_FUTURE_SKEW_MS) {
      this.logger.warn(
        `Webhook for invoiceId=${invoiceId} rejected: timestamp in the future (${ageMs}ms)`,
      );
      throw new BadRequestException('Webhook timestamp is in the future');
    }
  }

  private async applySuccess(
    webhook: WebhookPayload,
    body: Record<string, unknown>,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await manager
        .getRepository(Payment)
        .createQueryBuilder('payment')
        .setLock('pessimistic_write')
        .where('payment.providerInvoiceId = :invoiceId', {
          invoiceId: webhook.invoiceId,
        })
        .getOne();

      if (!payment) {
        this.logger.warn(
          `Webhook received for unknown invoiceId=${webhook.invoiceId}`,
        );
        return;
      }

      if (payment.status === PaymentStatus.SUCCESS) {
        this.logger.debug(
          `Payment ${payment.id} already SUCCESS, skipping duplicate webhook`,
        );
        return;
      }

      this.assertWebhookMatchesPayment(webhook, payment);

      const result = await manager
        .getRepository(Payment)
        .createQueryBuilder()
        .update(Payment)
        .set({
          status: PaymentStatus.SUCCESS,
          providerData: body,
        } as QueryDeepPartialEntity<Payment>)
        .where('id = :id AND status = :pending', {
          id: payment.id,
          pending: PaymentStatus.PENDING,
        })
        .execute();

      if (result.affected !== 1) {
        this.logger.warn(
          `Payment ${payment.id} status changed concurrently, skipping credit`,
        );
        return;
      }

      await manager.increment(
        User,
        { id: payment.userId },
        'credits',
        payment.creditsAmount,
      );

      this.logger.log(
        `Payment ${payment.id} succeeded — added ${payment.creditsAmount} credits to user ${payment.userId}`,
      );
    });
  }

  private async applyNonTerminalUpdate(
    webhook: WebhookPayload,
    body: Record<string, unknown>,
  ): Promise<void> {
    const result = await this.dataSource
      .getRepository(Payment)
      .createQueryBuilder()
      .update(Payment)
      .set({
        status: webhook.status,
        providerData: body,
      } as QueryDeepPartialEntity<Payment>)
      .where('provider_invoice_id = :invoiceId AND status = :pending', {
        invoiceId: webhook.invoiceId,
        pending: PaymentStatus.PENDING,
      })
      .execute();

    if (result.affected === 0) {
      this.logger.debug(
        `Webhook for invoiceId=${webhook.invoiceId} status=${webhook.status} ignored (unknown or non-pending)`,
      );
      return;
    }

    this.logger.log(
      `Webhook applied: invoiceId=${webhook.invoiceId}, status=${webhook.status}`,
    );
  }

  private assertWebhookMatchesPayment(
    webhook: WebhookPayload,
    payment: Payment,
  ): void {
    const mismatches: string[] = [];
    if (webhook.amount !== payment.amount) {
      mismatches.push(`amount(${webhook.amount}≠${payment.amount})`);
    }
    if (webhook.ccy !== payment.ccy) {
      mismatches.push(`ccy(${webhook.ccy}≠${payment.ccy})`);
    }
    if (webhook.reference && webhook.reference !== payment.id) {
      mismatches.push(`reference(${webhook.reference}≠${payment.id})`);
    }
    if (mismatches.length === 0) return;

    this.logger.error(
      `Webhook payload does not match payment ${payment.id}: ${mismatches.join(', ')}`,
    );
    throw new BadRequestException(
      'Webhook payload does not match the recorded invoice',
    );
  }
}
