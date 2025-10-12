import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddToken1752310172047 implements MigrationInterface {
  name = 'AddToken1752310172047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "token" ("id" uuid NOT NULL, "body" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_dd03f04c65c0b45ade37266614d" UNIQUE ("body"), CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "token"`);
  }
}
