import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationsTable1764080814256 implements MigrationInterface {
  name = 'AddNotificationsTable1764080814256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "type" character varying(100) NOT NULL,
        "message" text NOT NULL,
        "data" jsonb DEFAULT '{}',
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "read_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_created" ON "notifications" ("user_id", "created_at")`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_unread" ON "notifications" ("user_id", "is_read")`,
    );

    await queryRunner.query(
      `ALTER TABLE "notifications" 
       ADD CONSTRAINT "FK_notifications_user" 
       FOREIGN KEY ("user_id") 
       REFERENCES "users"("id") 
       ON DELETE CASCADE 
       ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_notifications_user_unread"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_notifications_user_created"`,
    );

    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
