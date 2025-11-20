import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeTableNames1763645468427 implements MigrationInterface {
  name = 'NormalizeTableNames1763645468427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint from token table
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT IF EXISTS "FK_e50ca89d635960fda2ffeb17639"`,
    );

    // Rename user table to users
    await queryRunner.query(`ALTER TABLE "user" RENAME TO "users"`);

    // Rename token table to tokens
    await queryRunner.query(`ALTER TABLE "token" RENAME TO "tokens"`);

    // Re-add foreign key constraint with updated table names
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraint from tokens table
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT IF EXISTS "FK_e50ca89d635960fda2ffeb17639"`,
    );

    // Rename tokens table back to token
    await queryRunner.query(`ALTER TABLE "tokens" RENAME TO "token"`);

    // Rename users table back to user
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "user"`);

    // Re-add foreign key constraint with original table names
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_e50ca89d635960fda2ffeb17639" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
