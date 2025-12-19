import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedVacancyEntity1766061399963 implements MigrationInterface {
  name = 'CreatedVacancyEntity1766061399963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancies_status_enum" AS ENUM('sent_cv', 'followup', 'test_task', 'interview', 'rejected', 'offer', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TABLE "vacancies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" text, "status" "public"."vacancies_status_enum" NOT NULL DEFAULT 'sent_cv', "parsed_data" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3b45154a366568190cc15be2906" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_vacancies" ("vacancy_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_7a67dec3ec238ae9c0f89ba2c5d" PRIMARY KEY ("vacancy_id", "user_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f62a84ec3aa26d8ece4a76312" ON "user_vacancies" ("vacancy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_88bfb7b9f90386c7401fd29827" ON "user_vacancies" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ADD CONSTRAINT "FK_3f62a84ec3aa26d8ece4a763122" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ADD CONSTRAINT "FK_88bfb7b9f90386c7401fd298274" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" DROP CONSTRAINT "FK_88bfb7b9f90386c7401fd298274"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" DROP CONSTRAINT "FK_3f62a84ec3aa26d8ece4a763122"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_88bfb7b9f90386c7401fd29827"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3f62a84ec3aa26d8ece4a76312"`,
    );
    await queryRunner.query(`DROP TABLE "user_vacancies"`);
    await queryRunner.query(`DROP TABLE "vacancies"`);
    await queryRunner.query(`DROP TYPE "public"."vacancies_status_enum"`);
  }
}
