import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentPlansAndSettings1776200000000 implements MigrationInterface {
  name = 'CreatePaymentPlansAndSettings1776200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "payment_plans" (
        "id"             character varying  NOT NULL,
        "name"           character varying  NOT NULL,
        "credits_amount" integer            NOT NULL,
        "price"          integer            NOT NULL,
        "currency"       character varying(3) NOT NULL,
        "ccy"            integer            NOT NULL,
        "is_active"      boolean            NOT NULL DEFAULT true,
        CONSTRAINT "PK_payment_plans" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      INSERT INTO "payment_plans" ("id", "name", "credits_amount", "price", "currency", "ccy")
      VALUES
        ('starter',  'Starter Pack',  10,  4900, 'UAH', 980),
        ('pro',      'Pro Pack',      30,  9900, 'UAH', 980),
        ('business', 'Business Pack', 100, 24900, 'UAH', 980)
    `);

    await queryRunner.query(`
      CREATE TABLE "payment_settings" (
        "id"                   boolean            NOT NULL DEFAULT true,
        "token_price_per_unit" integer            NOT NULL,
        "token_currency"       character varying(3) NOT NULL,
        "token_ccy"            integer            NOT NULL,
        CONSTRAINT "PK_payment_settings" PRIMARY KEY ("id"),
        CONSTRAINT "CK_payment_settings_singleton" CHECK (id = true)
      )
    `);

    await queryRunner.query(`
      INSERT INTO "payment_settings" ("id", "token_price_per_unit", "token_currency", "token_ccy")
      VALUES (true, 490, 'UAH', 980)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "payment_settings"`);
    await queryRunner.query(`DROP TABLE "payment_plans"`);
  }
}
