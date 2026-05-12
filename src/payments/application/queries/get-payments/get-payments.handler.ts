import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  type PaginatedResult,
} from '@/common/types/pagination';
import { GetPaymentsQuery } from './get-payments.query';
import { PaymentsService } from '../../payments.service';
import { Payment } from '@/payments/payment.entity';

export type GetPaymentsQueryResponse = PaginatedResult<Payment>;

@QueryHandler(GetPaymentsQuery)
@Injectable()
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(query: GetPaymentsQuery): Promise<GetPaymentsQueryResponse> {
    const { items, total } = await this.paymentsService.findByUserIdPaginated(
      query.userId,
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      items,
      meta: buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total),
    };
  }
}
