import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResumeAnalysis1774267133340 implements MigrationInterface {
  name = 'AddResumeAnalysis1774267133340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "match_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "ats_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "initial_ats_score" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "initial_match_score" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "initial_match_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" DROP COLUMN "initial_ats_score"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "ats_score" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "resume_analyses" ADD "match_score" integer`,
    );
  }
}
