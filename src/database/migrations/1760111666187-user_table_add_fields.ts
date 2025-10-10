import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTableAddFields1760111666187 implements MigrationInterface {
  name = 'UserTableAddFields1760111666187';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "avatar" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "credits" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "username" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "username"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "credits"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
  }
}
