import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserVacancyOrdering1776100000000 implements MigrationInterface {
  name = 'AddUserVacancyOrdering1776100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ADD COLUMN "status" "public"."vacancies_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ADD COLUMN "position" integer`,
    );
    await queryRunner.query(
      `UPDATE "user_vacancies" AS uv
      SET "status" = v."status"
      FROM "vacancies" AS v
      WHERE v."id" = uv."vacancy_id"`,
    );
    await queryRunner.query(
      `WITH ranked AS (
        SELECT
          uv."vacancy_id",
          uv."user_id",
          ROW_NUMBER() OVER (
            PARTITION BY uv."user_id", uv."status"
            ORDER BY v."created_at" DESC, uv."vacancy_id"
          ) - 1 AS pos
        FROM "user_vacancies" uv
        INNER JOIN "vacancies" v ON v."id" = uv."vacancy_id"
      )
      UPDATE "user_vacancies" AS uv
      SET "position" = ranked.pos
      FROM ranked
      WHERE uv."vacancy_id" = ranked."vacancy_id"
        AND uv."user_id" = ranked."user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ALTER COLUMN "status" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" ALTER COLUMN "position" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_vacancies_user_status_position" ON "user_vacancies" ("user_id", "status", "position") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_vacancies_user_status_position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" DROP COLUMN "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_vacancies" DROP COLUMN "status"`,
    );
  }
}
