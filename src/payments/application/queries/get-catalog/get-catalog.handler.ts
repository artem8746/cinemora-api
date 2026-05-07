import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetCatalogQuery } from './get-catalog.query';
import { PaymentsService } from '../../payments.service';
import { PaymentPlan } from '@/payments/payment-plan.entity';

export interface GetCatalogQueryResponse {
  plans: PaymentPlan[];
  tokenPricePerUnit: number;
  tokenCurrency: string;
  tokenCcy: number;
}

@QueryHandler(GetCatalogQuery)
@Injectable()
export class GetCatalogHandler implements IQueryHandler<GetCatalogQuery> {
  constructor(private readonly paymentsService: PaymentsService) {}

  async execute(): Promise<GetCatalogQueryResponse> {
    const [plans, settings] = await Promise.all([
      this.paymentsService.findActivePlans(),
      this.paymentsService.getSettings(),
    ]);

    return {
      plans,
      tokenPricePerUnit: settings.tokenPricePerUnit,
      tokenCurrency: settings.tokenCurrency,
      tokenCcy: settings.tokenCcy,
    };
  }
}
