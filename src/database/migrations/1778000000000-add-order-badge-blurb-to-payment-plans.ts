import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderBadgeBlurbToPaymentPlans1778000000000 implements MigrationInterface {
  name = 'AddOrderBadgeBlurbToPaymentPlans1778000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_plans"
        ADD COLUMN "order" integer NOT NULL DEFAULT 0,
        ADD COLUMN "badge" character varying,
        ADD COLUMN "blurb" character varying
    `);

    await queryRunner.query(`
      UPDATE "payment_plans" SET "order" = 1, "blurb" = 'Great way to get started' WHERE "id" = 'starter'
    `);
    await queryRunner.query(`
      UPDATE "payment_plans" SET "order" = 2, "badge" = 'Popular', "blurb" = 'Best value for money' WHERE "id" = 'pro'
    `);
    await queryRunner.query(`
      UPDATE "payment_plans" SET "order" = 3, "blurb" = 'For power users and teams' WHERE "id" = 'business'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_plans"
        DROP COLUMN "order",
        DROP COLUMN "badge",
        DROP COLUMN "blurb"
    `);
  }
}
