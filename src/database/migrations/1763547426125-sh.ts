import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sh1763547426125 implements MigrationInterface {
  name = 'Sh1763547426125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "appearance" jsonb NOT NULL DEFAULT '{}', "notifications" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4ed056b9344e6f7d8d46ec4b302" UNIQUE ("user_id"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."connected_accounts_provider_enum" AS ENUM('google', 'github')`,
    );
    await queryRunner.query(
      `CREATE TABLE "connected_accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "provider" "public"."connected_accounts_provider_enum" NOT NULL, "provider_account_id" character varying NOT NULL, "provider_account_email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_50cccbeff7eb4ccf2d5952df8d3" UNIQUE ("user_id", "provider"), CONSTRAINT "PK_70416f1da0be645bb31da01c774" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f47244225a6a1eac04a3463dd9" ON "connected_accounts" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_email_verified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "password_changed_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "is_2fa_enabled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "two_factor_secret" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" ADD CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "connected_accounts" DROP CONSTRAINT "FK_f47244225a6a1eac04a3463dd90"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "two_factor_secret"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "is_2fa_enabled"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "password_changed_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "is_email_verified"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f47244225a6a1eac04a3463dd9"`,
    );
    await queryRunner.query(`DROP TABLE "connected_accounts"`);
    await queryRunner.query(
      `DROP TYPE "public"."connected_accounts_provider_enum"`,
    );
    await queryRunner.query(`DROP TABLE "user_settings"`);
  }
}
