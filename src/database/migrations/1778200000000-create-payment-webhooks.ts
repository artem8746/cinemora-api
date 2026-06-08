import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentWebhooks1778200000000 implements MigrationInterface {
  name = 'CreatePaymentWebhooks1778200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type WHERE typname = 'payment_webhooks_outcome_enum'
        ) THEN
          CREATE TYPE "payment_webhooks_outcome_enum" AS ENUM (
            'received',
            'applied',
            'ignored_duplicate',
            'ignored_unknown_invoice',
            'rejected_signature',
            'rejected_validation',
            'error'
          );
        END IF;
      END$$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_webhooks" (
        "id"                  uuid                            NOT NULL DEFAULT uuid_generate_v4(),
        "provider_name"       varchar                         NOT NULL,
        "provider_invoice_id" varchar,
        "payment_id"          uuid,
        "raw_body"            text                            NOT NULL,
        "signature"           text                            NOT NULL,
        "outcome"             "payment_webhooks_outcome_enum" NOT NULL DEFAULT 'received',
        "error_message"       text,
        "received_at"         TIMESTAMP WITH TIME ZONE        NOT NULL DEFAULT now(),
        "processed_at"        TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_payment_webhooks" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_webhooks_provider_invoice_id" ON "payment_webhooks" ("provider_invoice_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_webhooks_received_at" ON "payment_webhooks" ("received_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payment_webhooks_payment_id" ON "payment_webhooks" ("payment_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_webhooks_payment_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_webhooks_received_at"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payment_webhooks_provider_invoice_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_webhooks"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "payment_webhooks_outcome_enum"`,
    );
  }
}
