import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTableAddPositionLocation1761902581365
  implements MigrationInterface
{
  name = 'UserTableAddPositionLocation1761902581365';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "position" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "location" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "location"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "position"`);
  }
}
