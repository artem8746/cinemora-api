import { Column, Entity, PrimaryColumn } from 'typeorm';

// Singleton row — id is always true, enforced by a CHECK constraint in the migration
@Entity('payment_settings')
export class PaymentSettings {
  @PrimaryColumn({ type: 'boolean' })
  id: boolean;

  @Column({ type: 'integer', name: 'token_price_per_unit' })
  tokenPricePerUnit: number;

  @Column({ type: 'varchar', length: 3, name: 'token_currency' })
  tokenCurrency: string;

  @Column({ type: 'integer', name: 'token_ccy' })
  tokenCcy: number;
}
