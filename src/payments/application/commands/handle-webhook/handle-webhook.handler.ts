import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { HandleWebhookCommand } from './handle-webhook.command';
import {
  PAYMENT_PROVIDER_PORT,
  IPaymentProviderPort,
  WebhookPayload,
} from '../../../domain/payment-provider.port';
import { PaymentStatus } from '../../../domain/payment.types';
import { Payment } from '../../../payment.entity';
import {
  PaymentWebhook,
  PaymentWebhookOutcome,
} from '../../../payment-webhook.entity';
import { User } from '@/users/user.entity';

interface ApplyResult {
  outcome: PaymentWebhookOutcome;
  paymentId: string | null;
}

@CommandHandler(HandleWebhookCommand)
@Injectable()
export class HandleWebhookHandler implements ICommandHandler<HandleWebhookCommand> {
  private readonly logger = new Logger(HandleWebhookHandler.name);

  private static readonly MAX_FUTURE_SKEW_MS = 60 * 1000;

  constructor(
    @Inject(PAYMENT_PROVIDER_PORT)
    private readonly paymentProvider: IPaymentProviderPort,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(command: HandleWebhookCommand): Promise<void> {
    const { rawBody, signature, body } = command;

    const eventId = await this.recordReceived(rawBody, signature);

    try {
      const result = await this.process(rawBody, signature, body, eventId);
      await this.finalize(eventId, result);
    } catch (err) {
      await this.finalize(eventId, this.outcomeFromError(err));
      throw err;
    }
  }

  private async process(
    rawBody: Buffer,
    signature: string,
    body: Record<string, unknown>,
    eventId: string,
  ): Promise<ApplyResult> {
    const isValid = await this.paymentProvider.verifyWebhookSignature(
      rawBody,
      signature,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const webhook = this.paymentProvider.parseWebhookBody(body);
    // Eagerly persist invoiceId so the audit row is filterable even if a
    // later step throws.
    await this.attachInvoiceId(eventId, webhook.invoiceId);

    this.assertNotFromFuture(webhook.modifiedAt, webhook.invoiceId);

    return webhook.status === PaymentStatus.SUCCESS
      ? await this.applySuccess(webhook, body)
      : await this.applyStatusUpdate(webhook, body);
  }

  private assertNotFromFuture(modifiedAt: Date, invoiceId: string): void {
    const ageMs = Date.now() - modifiedAt.getTime();
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
  ): Promise<ApplyResult> {
    type SuccessResult = ApplyResult & {
      credited?: { userId: string; creditsAmount: number };
    };

    const result = await this.dataSource.transaction<SuccessResult>(
      async (manager) => {
        const payment = await this.lockPaymentByInvoiceId(
          manager,
          webhook.invoiceId,
        );

        if (!payment) {
          this.logger.warn(
            `Webhook received for unknown invoiceId=${webhook.invoiceId}`,
          );
          return {
            outcome: PaymentWebhookOutcome.IGNORED_UNKNOWN_INVOICE,
            paymentId: null,
          };
        }

        if (payment.status === PaymentStatus.SUCCESS) {
          this.logger.debug(
            `Payment ${payment.id} already SUCCESS, skipping duplicate webhook`,
          );
          return {
            outcome: PaymentWebhookOutcome.IGNORED_DUPLICATE,
            paymentId: payment.id,
          };
        }

        // Terminal non-SUCCESS states must not be upgraded by a late SUCCESS
        // webhook — mirrors the guard in applyMissedSuccess and applyStatusUpdate.
        if (payment.status !== PaymentStatus.PENDING) {
          this.logger.warn(
            `Webhook reports SUCCESS but payment ${payment.id} is locally ${payment.status}; not crediting`,
          );
          return {
            outcome: PaymentWebhookOutcome.IGNORED_DUPLICATE,
            paymentId: payment.id,
          };
        }

        this.assertWebhookMatchesPayment(webhook, payment);

        await manager.update(Payment, payment.id, {
          status: PaymentStatus.SUCCESS,
          providerData: body,
        } as QueryDeepPartialEntity<Payment>);

        await manager.increment(
          User,
          { id: payment.userId },
          'credits',
          payment.creditsAmount,
        );

        return {
          outcome: PaymentWebhookOutcome.APPLIED,
          paymentId: payment.id,
          credited: {
            userId: payment.userId,
            creditsAmount: payment.creditsAmount,
          },
        };
      },
    );

    if (result.credited) {
      this.logger.log(
        `Payment ${result.paymentId} succeeded — added ${result.credited.creditsAmount} credits to user ${result.credited.userId}`,
      );
    }

    return { outcome: result.outcome, paymentId: result.paymentId };
  }

  private async applyStatusUpdate(
    webhook: WebhookPayload,
    body: Record<string, unknown>,
  ): Promise<ApplyResult> {
    const result = await this.dataSource.transaction<ApplyResult>(
      async (manager) => {
        const payment = await this.lockPaymentByInvoiceId(
          manager,
          webhook.invoiceId,
        );

        if (!payment) {
          this.logger.warn(
            `Webhook received for unknown invoiceId=${webhook.invoiceId}`,
          );
          return {
            outcome: PaymentWebhookOutcome.IGNORED_UNKNOWN_INVOICE,
            paymentId: null,
          };
        }

        if (payment.status !== PaymentStatus.PENDING) {
          this.logger.debug(
            `Webhook for invoiceId=${webhook.invoiceId} status=${webhook.status} ignored (payment already in terminal state ${payment.status})`,
          );
          return {
            outcome: PaymentWebhookOutcome.IGNORED_DUPLICATE,
            paymentId: payment.id,
          };
        }

        this.assertWebhookMatchesPayment(webhook, payment);

        await manager.update(Payment, payment.id, {
          status: webhook.status,
          providerData: body,
        } as QueryDeepPartialEntity<Payment>);

        return {
          outcome: PaymentWebhookOutcome.APPLIED,
          paymentId: payment.id,
        };
      },
    );

    if (result.outcome === PaymentWebhookOutcome.APPLIED) {
      this.logger.log(
        `Webhook applied: invoiceId=${webhook.invoiceId}, status=${webhook.status}`,
      );
    }

    return result;
  }

  private lockPaymentByInvoiceId(
    manager: EntityManager,
    invoiceId: string,
  ): Promise<Payment | null> {
    return manager
      .getRepository(Payment)
      .createQueryBuilder('payment')
      .setLock('pessimistic_write')
      .where('payment.providerInvoiceId = :invoiceId', { invoiceId })
      .getOne();
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

  private async recordReceived(
    rawBody: Buffer,
    signature: string,
  ): Promise<string> {
    const event = await this.dataSource.getRepository(PaymentWebhook).save({
      providerName: this.paymentProvider.providerName,
      rawBody: rawBody.toString('utf8'),
      signature,
      outcome: PaymentWebhookOutcome.RECEIVED,
    });
    return event.id;
  }

  private async attachInvoiceId(
    eventId: string,
    invoiceId: string,
  ): Promise<void> {
    await this.dataSource
      .getRepository(PaymentWebhook)
      .update(eventId, { providerInvoiceId: invoiceId });
  }

  private async finalize(
    eventId: string,
    result: ApplyResult & { errorMessage?: string | null },
  ): Promise<void> {
    try {
      await this.dataSource.getRepository(PaymentWebhook).update(eventId, {
        outcome: result.outcome,
        paymentId: result.paymentId,
        errorMessage: result.errorMessage ?? null,
        processedAt: new Date(),
      });
    } catch (err) {
      this.logger.error(
        `Failed to finalize webhook_event ${eventId} (outcome=${result.outcome})`,
        err,
      );
    }
  }

  private outcomeFromError(err: unknown): ApplyResult & {
    errorMessage: string;
  } {
    const message = err instanceof Error ? err.message : String(err);
    if (err instanceof UnauthorizedException) {
      return {
        outcome: PaymentWebhookOutcome.REJECTED_SIGNATURE,
        paymentId: null,
        errorMessage: message,
      };
    }
    if (err instanceof BadRequestException) {
      return {
        outcome: PaymentWebhookOutcome.REJECTED_VALIDATION,
        paymentId: null,
        errorMessage: message,
      };
    }
    return {
      outcome: PaymentWebhookOutcome.ERROR,
      paymentId: null,
      errorMessage: message,
    };
  }
}
