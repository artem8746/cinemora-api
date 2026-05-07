import { MigrationInterface, QueryRunner } from 'typeorm';

export class HardenPayments1777833643026 implements MigrationInterface {
  name = 'HardenPayments1777833643026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Idempotent: each step is a no-op if a previous (partial) run already
    // applied it. Lets us recover from interleaved attempts without manual
    // surgery.

    // Rename enum to TypeORM convention {table}_{column}_enum.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum')
           AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payments_status_enum') THEN
          ALTER TYPE "payment_status_enum" RENAME TO "payments_status_enum";
        END IF;
      END$$;
    `);

    // Add ccy column with a temporary default, backfill from payment_plans,
    // then drop the default to match the entity definition.
    await queryRunner.query(
      `ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "ccy" integer NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(`
      UPDATE "payments" p
         SET "ccy" = pp."ccy"
        FROM "payment_plans" pp
       WHERE p."plan_id" = pp."id"
         AND p."ccy" = 0
    `);
    await queryRunner.query(
      `ALTER TABLE "payments" ALTER COLUMN "ccy" DROP DEFAULT`,
    );

    // Replace single-column user_id index with composite (user_id, status).
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_user_id"`);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_user_id_status" ON "payments" ("user_id", "status")`,
    );

    // Replace non-unique provider_invoice_id index with a UNIQUE partial index
    // (DB-level idempotency that backstops the application-level guard).
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payments_provider_invoice_id"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_payments_provider_invoice_id" ON "payments" ("provider_invoice_id") WHERE "provider_invoice_id" IS NOT NULL`,
    );

    // ISO-4217 format checks.
    await this.addCheckIfMissing(
      queryRunner,
      'payments',
      'CK_payments_currency_iso4217',
      "currency ~ '^[A-Z]{3}$'",
    );
    await this.addCheckIfMissing(
      queryRunner,
      'payment_plans',
      'CK_payment_plans_currency_iso4217',
      "currency ~ '^[A-Z]{3}$'",
    );
    await this.addCheckIfMissing(
      queryRunner,
      'payment_settings',
      'CK_payment_settings_currency_iso4217',
      "token_currency ~ '^[A-Z]{3}$'",
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "payment_settings" DROP CONSTRAINT IF EXISTS "CK_payment_settings_currency_iso4217"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payment_plans" DROP CONSTRAINT IF EXISTS "CK_payment_plans_currency_iso4217"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "CK_payments_currency_iso4217"`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_payments_provider_invoice_id"`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_provider_invoice_id" ON "payments" ("provider_invoice_id")`,
    );

    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_payments_user_id_status"`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_user_id" ON "payments" ("user_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "payments" DROP COLUMN IF EXISTS "ccy"`,
    );

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payments_status_enum')
           AND NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
          ALTER TYPE "payments_status_enum" RENAME TO "payment_status_enum";
        END IF;
      END$$;
    `);
  }

  private async addCheckIfMissing(
    queryRunner: QueryRunner,
    table: string,
    constraintName: string,
    expression: string,
  ): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}'
        ) THEN
          ALTER TABLE "${table}" ADD CONSTRAINT "${constraintName}"
            CHECK (${expression});
        END IF;
      END$$;
    `);
  }
}
