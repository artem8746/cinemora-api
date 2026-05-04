import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BadGatewayException,
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateInvoiceCommand } from './create-invoice.command';
import { PaymentsService } from '../../payments.service';
import {
  PAYMENT_PROVIDER_PORT,
  IPaymentProviderPort,
  InvoiceResult,
} from '../../../domain/payment-provider.port';
import { PaymentStatus } from '../../../domain/payment.types';
import { Payment } from '../../../payment.entity';
import { Configuration } from '@/config';
import {
  IDEMPOTENCY_STORE,
  IIdempotencyStore,
} from '@/common/idempotency/idempotency-store.port';

export interface CreateInvoiceCommandResponse {
  paymentId: string;
  pageUrl: string;
}

interface ResolvedPlan {
  id: string;
  name: string;
  creditsAmount: number;
  price: number;
  currency: string;
  ccy: number;
}

interface InvoiceUrls {
  redirectUrl: string;
  webHookUrl: string;
}

@CommandHandler(CreateInvoiceCommand)
@Injectable()
export class CreateInvoiceHandler implements ICommandHandler<CreateInvoiceCommand> {
  private readonly logger = new Logger(CreateInvoiceHandler.name);
  private static readonly IDEMPOTENCY_NAMESPACE = 'payments:invoice';
  private static readonly CUSTOM_PLAN_ID = 'custom';

  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(PAYMENT_PROVIDER_PORT)
    private readonly paymentProvider: IPaymentProviderPort,
    private readonly configService: ConfigService<Configuration>,
    @Inject(IDEMPOTENCY_STORE)
    private readonly idempotencyStore: IIdempotencyStore,
  ) {}

  execute(
    command: CreateInvoiceCommand,
  ): Promise<CreateInvoiceCommandResponse> {
    return this.idempotencyStore.execute(
      {
        namespace: CreateInvoiceHandler.IDEMPOTENCY_NAMESPACE,
        key: `${command.userId}:${command.idempotencyKey}`,
      },
      () => this.runCreateInvoice(command),
    );
  }

  private async runCreateInvoice(
    command: CreateInvoiceCommand,
  ): Promise<CreateInvoiceCommandResponse> {
    const plan = await this.resolvePlan(command);
    const payment = await this.createPendingPayment(command.userId, plan);
    const urls = this.buildInvoiceUrls(payment.id);
    const invoice = await this.callProvider(payment, plan, urls);

    await this.paymentsService.update(payment.id, {
      providerInvoiceId: invoice.invoiceId,
    });

    this.logger.log(
      `Invoice created: paymentId=${payment.id}, userId=${command.userId}, plan=${plan.id}`,
    );

    return { paymentId: payment.id, pageUrl: invoice.pageUrl };
  }

  private async resolvePlan(
    command: CreateInvoiceCommand,
  ): Promise<ResolvedPlan> {
    const { planId, tokenAmount } = command;

    if (planId !== undefined && tokenAmount !== undefined) {
      throw new BadRequestException(
        'Provide either planId or tokenAmount, not both',
      );
    }

    if (planId !== undefined) {
      const plan = await this.paymentsService.findPlanById(planId);
      if (!plan) {
        throw new NotFoundException(`Payment plan "${planId}" not found`);
      }
      return plan;
    }

    if (tokenAmount !== undefined) {
      const settings = await this.paymentsService.getSettings();
      return {
        id: CreateInvoiceHandler.CUSTOM_PLAN_ID,
        name: `${tokenAmount} Credits`,
        creditsAmount: tokenAmount,
        price: tokenAmount * settings.tokenPricePerUnit,
        currency: settings.tokenCurrency,
        ccy: settings.tokenCcy,
      };
    }

    throw new BadRequestException('Provide either planId or tokenAmount');
  }

  private createPendingPayment(
    userId: string,
    plan: ResolvedPlan,
  ): Promise<Payment> {
    return this.paymentsService.create({
      userId,
      planId: plan.id,
      amount: plan.price,
      currency: plan.currency,
      ccy: plan.ccy,
      creditsAmount: plan.creditsAmount,
      status: PaymentStatus.PENDING,
      providerName: this.paymentProvider.providerName,
    });
  }

  private buildInvoiceUrls(paymentId: string): InvoiceUrls {
    const domain = this.configService.getOrThrow('app.domain');
    const frontendUrl = this.configService.getOrThrow('app.frontendUrl');
    const baseRedirect =
      this.configService.get('payment.successRedirectUrl') ??
      `${frontendUrl}/payment/success`;
    const redirectUrl = new URL(baseRedirect);
    redirectUrl.searchParams.set('paymentId', paymentId);
    return {
      redirectUrl: redirectUrl.toString(),
      webHookUrl:
        this.configService.get('payment.webhookPublicUrl') ??
        `${domain}/api/payments/webhook/plata`,
    };
  }

  private async callProvider(
    payment: Payment,
    plan: ResolvedPlan,
    urls: InvoiceUrls,
  ): Promise<InvoiceResult> {
    try {
      return await this.paymentProvider.createInvoice({
        paymentId: payment.id,
        amount: plan.price,
        ccy: plan.ccy,
        planName: plan.name,
        planId: plan.id,
        redirectUrl: urls.redirectUrl,
        webHookUrl: urls.webHookUrl,
      });
    } catch (err) {
      await this.paymentsService.update(payment.id, {
        status: PaymentStatus.FAILED,
      });
      this.logger.error(
        `Provider failed to create invoice: paymentId=${payment.id}, userId=${payment.userId}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new BadGatewayException(
        'Payment provider is unavailable, please try again later',
        { cause: err instanceof Error ? err : undefined },
      );
    }
  }
}
