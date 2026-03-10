import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVacancyNotesTable1768037836858 implements MigrationInterface {
  name = 'AddVacancyNotesTable1768037836858';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."vacancy_notes_type_enum" AS ENUM('contact_call', 'email', 'interview_prep', 'general_note', 'followup_reminder')`,
    );

    await queryRunner.query(
      `CREATE TABLE "vacancy_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "vacancy_id" uuid NOT NULL,
        "type" "public"."vacancy_notes_type_enum" NOT NULL,
        "title" character varying(255),
        "content" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vacancy_notes_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_vacancy_notes_vacancy_id" ON "vacancy_notes" ("vacancy_id")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_vacancy_notes_vacancy_created" ON "vacancy_notes" ("vacancy_id", "created_at")`,
    );

    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" 
       ADD CONSTRAINT "FK_vacancy_notes_vacancy" 
       FOREIGN KEY ("vacancy_id") 
       REFERENCES "vacancies"("id") 
       ON DELETE CASCADE 
       ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancy_notes" DROP CONSTRAINT "FK_vacancy_notes_vacancy"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_vacancy_notes_vacancy_created"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_vacancy_notes_vacancy_id"`,
    );

    await queryRunner.query(`DROP TABLE "vacancy_notes"`);

    await queryRunner.query(`DROP TYPE "public"."vacancy_notes_type_enum"`);
  }
}
