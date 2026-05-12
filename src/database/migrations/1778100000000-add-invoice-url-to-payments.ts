import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceUrlToPayments1778100000000 implements MigrationInterface {
  name = 'AddInvoiceUrlToPayments1778100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "invoice_url" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "invoice_url"`,
    );
  }
}
