import { User } from '@/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from './domain/payment.types';

@Entity('payments')
@Index(['userId', 'status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', name: 'plan_id' })
  planId: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'integer' })
  ccy: number;

  @Column({ type: 'integer', name: 'credits_amount' })
  creditsAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    enumName: 'payments_status_enum',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'varchar', name: 'provider_name' })
  providerName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', name: 'provider_invoice_id', nullable: true })
  providerInvoiceId: string | null;

  @Column({ type: 'jsonb', name: 'provider_data', nullable: true })
  providerData: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
