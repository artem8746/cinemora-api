import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  BadGatewayException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GetPaymentReceiptQuery } from './get-payment-receipt.query';
import { PaymentsService } from '../../payments.service';
import {
  IPaymentProviderPort,
  PAYMENT_PROVIDER_PORT,
} from '../../../domain/payment-provider.port';
import { PaymentStatus } from '../../../domain/payment.types';

export interface GetPaymentReceiptQueryResponse {
  pdfBase64: string;
  mimeType: 'application/pdf';
}

@QueryHandler(GetPaymentReceiptQuery)
@Injectable()
export class GetPaymentReceiptHandler implements IQueryHandler<GetPaymentReceiptQuery> {
  private readonly logger = new Logger(GetPaymentReceiptHandler.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(PAYMENT_PROVIDER_PORT)
    private readonly paymentProvider: IPaymentProviderPort,
  ) {}

  async execute(
    query: GetPaymentReceiptQuery,
  ): Promise<GetPaymentReceiptQueryResponse> {
    const payment = await this.paymentsService.findById(query.paymentId);

    // Same NotFound for missing and foreign payments to avoid id enumeration.
    if (!payment || payment.userId !== query.userId) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new ConflictException(
        'Receipt is only available for successful payments',
      );
    }

    if (!payment.providerInvoiceId) {
      throw new ConflictException('Payment has no associated provider invoice');
    }

    try {
      const { file } = await this.paymentProvider.getReceipt(
        payment.providerInvoiceId,
      );
      return { pdfBase64: file, mimeType: 'application/pdf' };
    } catch (err) {
      this.logger.error(
        `Failed to fetch receipt from provider: paymentId=${payment.id}, providerInvoiceId=${payment.providerInvoiceId}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new BadGatewayException(
        'Payment provider is unavailable, please try again later',
        { cause: err instanceof Error ? err : undefined },
      );
    }
  }
}
