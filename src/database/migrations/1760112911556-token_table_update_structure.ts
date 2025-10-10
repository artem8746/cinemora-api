import { MigrationInterface, QueryRunner } from 'typeorm';

export class TokenTableUpdateStructure1760112911556
  implements MigrationInterface
{
  name = 'TokenTableUpdateStructure1760112911556';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "UQ_dd03f04c65c0b45ade37266614d"`,
    );
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "body"`);
    await queryRunner.query(
      `ALTER TABLE "token" ADD "refreshToken" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "UQ_9075147ba4bb2ead8bac71ccc83" UNIQUE ("refreshToken")`,
    );
    await queryRunner.query(`ALTER TABLE "token" ADD "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE "token" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_e50ca89d635960fda2ffeb17639"`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ALTER COLUMN "id" DROP DEFAULT`,
    );
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "UQ_9075147ba4bb2ead8bac71ccc83"`,
    );
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "refreshToken"`);
    await queryRunner.query(
      `ALTER TABLE "token" ADD "body" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "UQ_dd03f04c65c0b45ade37266614d" UNIQUE ("body")`,
    );
  }
}
