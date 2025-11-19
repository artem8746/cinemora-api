import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFilesTable1763555104309 implements MigrationInterface {
  name = 'AddFilesTable1763555104309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."files_file_type_enum" AS ENUM('avatar', 'resume')`,
    );
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "file_type" "public"."files_file_type_enum" NOT NULL, "key" character varying(500) NOT NULL, "mime_type" character varying(100) NOT NULL, "size_bytes" integer NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ebec48b969b0cc50c23e4773cc" ON "files" ("user_id", "file_type") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ebec48b969b0cc50c23e4773cc"`,
    );
    await queryRunner.query(`DROP TABLE "files"`);
    await queryRunner.query(`DROP TYPE "public"."files_file_type_enum"`);
  }
}
