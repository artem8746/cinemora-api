import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewSettingsColumns1764144554446 implements MigrationInterface {
  name = 'AddNewSettingsColumns1764144554446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "personal_info" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "ai_settings" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD "job_preferences" jsonb NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "job_preferences"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "ai_settings"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP COLUMN "personal_info"`,
    );
  }
}
