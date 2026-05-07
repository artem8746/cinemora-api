import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentPlan } from './payment-plan.entity';
import { PaymentSettings } from './payment-settings.entity';
import { PaymentsController } from './presentation/payments.controller';
import { PaymentsService } from './application/payments.service';
import { PAYMENT_PROVIDER_PORT } from './domain/payment-provider.port';
import { PlataPaymentProviderAdapter } from './infrastructure/plata/plata-payment-provider.adapter';
import { CreateInvoiceHandler } from './application/commands/create-invoice/create-invoice.handler';
import { HandleWebhookHandler } from './application/commands/handle-webhook/handle-webhook.handler';
import { GetPaymentsHandler } from './application/queries/get-payments/get-payments.handler';
import { GetCatalogHandler } from './application/queries/get-catalog/get-catalog.handler';
import { GetPaymentByIdHandler } from './application/queries/get-payment-by-id/get-payment-by-id.handler';

const CommandHandlers = [CreateInvoiceHandler, HandleWebhookHandler];
const QueryHandlers = [
  GetPaymentsHandler,
  GetCatalogHandler,
  GetPaymentByIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([Payment, PaymentPlan, PaymentSettings]),
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_PROVIDER_PORT,
      useClass: PlataPaymentProviderAdapter,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class PaymentsModule {}
