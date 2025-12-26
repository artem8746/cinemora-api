import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedResumeTable1766734448351 implements MigrationInterface {
  name = 'CreatedResumeTable1766734448351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_notifications_user_created"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_notifications_user_unread"`,
    );
    await queryRunner.query(
      `CREATE TABLE "resumes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying(255) NOT NULL, "full_name" character varying(255) NOT NULL, "job_title" character varying(255), "parsed_data" jsonb NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9c8677802096d6baece48429d2e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0982a8a485bb0a0c2f7bed3e29" ON "resumes" ("full_name") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c8f7a0974ea1de7941d764b6d" ON "resumes" ("title") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dce6e1ce26d348e602f56fa636" ON "resumes" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_310667f935698fcd8cb319113a" ON "notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_af08fad7c04bb85403970afdc1" ON "notifications" ("user_id", "is_read") `,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes" ADD CONSTRAINT "FK_dce6e1ce26d348e602f56fa6363" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resumes" DROP CONSTRAINT "FK_dce6e1ce26d348e602f56fa6363"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_af08fad7c04bb85403970afdc1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_310667f935698fcd8cb319113a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dce6e1ce26d348e602f56fa636"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c8f7a0974ea1de7941d764b6d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0982a8a485bb0a0c2f7bed3e29"`,
    );
    await queryRunner.query(`DROP TABLE "resumes"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_unread" ON "notifications" ("user_id", "is_read") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_created" ON "notifications" ("user_id", "created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
