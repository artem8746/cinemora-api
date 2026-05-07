import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('payment_plans')
export class PaymentPlan {
  @PrimaryColumn({ type: 'varchar' })
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'integer', name: 'credits_amount' })
  creditsAmount: number;

  @Column({ type: 'integer' })
  price: number;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'integer' })
  ccy: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;
}
