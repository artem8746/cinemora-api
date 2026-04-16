import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAppliedAndScoresAfterApplyFieldsToResumeAnalysis1776075992739 implements MigrationInterface {
  name = 'AddIsAppliedAndScoresAfterApplyFieldsToResumeAnalysis1776075992739';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" DROP CONSTRAINT "FK_vacancy_notes_vacancy"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vacancy_notes_vacancy_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_vacancy_notes_vacancy_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "is_applied" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "applied_ats_score" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "applied_match_score" integer`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_36e61281860341870fc8ade611" ON "vacancy_notes" ("vacancy_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4b653d171499badfd0cd0e6d9a" ON "vacancy_notes" ("vacancy_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" ADD CONSTRAINT "FK_4b653d171499badfd0cd0e6d9a4" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" DROP CONSTRAINT "FK_4b653d171499badfd0cd0e6d9a4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4b653d171499badfd0cd0e6d9a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_36e61281860341870fc8ade611"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "applied_match_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "applied_ats_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "is_applied"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vacancy_notes_vacancy_created" ON "vacancy_notes" ("vacancy_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vacancy_notes_vacancy_id" ON "vacancy_notes" ("vacancy_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" ADD CONSTRAINT "FK_vacancy_notes_vacancy" FOREIGN KEY ("vacancy_id") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
