import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetPaymentByIdQuery } from './get-payment-by-id.query';
import { PaymentsService } from '../../payments.service';
import { Payment } from '@/payments/payment.entity';

export type GetPaymentByIdQueryResponse = Payment;

@QueryHandler(GetPaymentByIdQuery)
@Injectable()
export class GetPaymentByIdHandler implements IQueryHandler<GetPaymentByIdQuery> {
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(
    query: GetPaymentByIdQuery,
  ): Promise<GetPaymentByIdQueryResponse> {
    const payment = await this.paymentsService.findById(query.paymentId);

    if (!payment || payment.userId !== query.userId) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
