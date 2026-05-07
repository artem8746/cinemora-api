import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentsTable1745380000000 implements MigrationInterface {
  name = 'CreatePaymentsTable1745380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "payment_status_enum" AS ENUM ('pending', 'success', 'failed', 'expired', 'reversed')`,
    );

    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id"                  uuid                      NOT NULL DEFAULT uuid_generate_v4(),
        "user_id"             uuid                      NOT NULL,
        "plan_id"             character varying         NOT NULL,
        "amount"              integer                   NOT NULL,
        "currency"            character varying(3)      NOT NULL,
        "credits_amount"      integer                   NOT NULL,
        "status"              "payment_status_enum"     NOT NULL DEFAULT 'pending',
        "provider_name"       character varying         NOT NULL,
        "provider_invoice_id" character varying,
        "provider_data"       jsonb,
        "created_at"          TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payments_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_payments_user_id" ON "payments" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_payments_provider_invoice_id" ON "payments" ("provider_invoice_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_payments_provider_invoice_id"`);
    await queryRunner.query(`DROP INDEX "IDX_payments_user_id"`);
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "payment_status_enum"`);
  }
}
