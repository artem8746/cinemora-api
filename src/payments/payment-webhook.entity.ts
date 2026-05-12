import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentWebhookOutcome {
  RECEIVED = 'received',
  APPLIED = 'applied',
  IGNORED_DUPLICATE = 'ignored_duplicate',
  IGNORED_UNKNOWN_INVOICE = 'ignored_unknown_invoice',
  REJECTED_SIGNATURE = 'rejected_signature',
  REJECTED_VALIDATION = 'rejected_validation',
  ERROR = 'error',
}

@Entity('payment_webhooks')
@Index(['providerInvoiceId'])
@Index(['receivedAt'])
@Index(['paymentId'])
export class PaymentWebhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', name: 'provider_name' })
  providerName: string;

  @Column({ type: 'varchar', name: 'provider_invoice_id', nullable: true })
  providerInvoiceId: string | null;

  @Column({ type: 'uuid', name: 'payment_id', nullable: true })
  paymentId: string | null;

  @Column({ type: 'text', name: 'raw_body' })
  rawBody: string;

  @Column({ type: 'text' })
  signature: string;

  @Column({
    type: 'enum',
    enum: PaymentWebhookOutcome,
    enumName: 'payment_webhooks_outcome_enum',
    default: PaymentWebhookOutcome.RECEIVED,
  })
  outcome: PaymentWebhookOutcome;

  @Column({ type: 'text', name: 'error_message', nullable: true })
  errorMessage: string | null;

  @CreateDateColumn({ name: 'received_at', type: 'timestamptz' })
  receivedAt: Date;

  @Column({
    type: 'timestamptz',
    name: 'processed_at',
    nullable: true,
  })
  processedAt: Date | null;
}
