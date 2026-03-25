import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserTableMakePasswordOptional1760023368694 implements MigrationInterface {
  name = 'UserTableMakePasswordOptional1760023368694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`,
    );
  }
}
