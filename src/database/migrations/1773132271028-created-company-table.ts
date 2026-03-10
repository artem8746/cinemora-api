import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatedCompanyTable1773132271028 implements MigrationInterface {
  name = 'CreatedCompanyTable1773132271028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP CONSTRAINT "FK_vacancies_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sources" DROP CONSTRAINT "FK_company_sources_company"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_vacancies_company_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_company_sources_company_collected"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sources" DROP CONSTRAINT "UQ_company_sources_company_type_url"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_companies_normalized_name"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7365b1a49f7801ed1e062d0e01" ON "companies" ("normalized_name") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_98db5beace7f0a03ebadd46750" ON "company_sources" ("company_id", "source_type", "source_url") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff126923f458921077ff5918bd" ON "company_sources" ("company_id", "collected_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD CONSTRAINT "FK_053198d00d977357314f47d1cf2" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sources" ADD CONSTRAINT "FK_6ffab1c9a687f5b1d72223080df" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_sources" DROP CONSTRAINT "FK_6ffab1c9a687f5b1d72223080df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" DROP CONSTRAINT "FK_053198d00d977357314f47d1cf2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff126923f458921077ff5918bd"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_98db5beace7f0a03ebadd46750"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7365b1a49f7801ed1e062d0e01"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_companies_normalized_name" UNIQUE ("normalized_name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sources" ADD CONSTRAINT "UQ_company_sources_company_type_url" UNIQUE ("company_id", "source_type", "source_url")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_company_sources_company_collected" ON "company_sources" ("company_id", "collected_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_vacancies_company_id" ON "vacancies" ("company_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company_sources" ADD CONSTRAINT "FK_company_sources_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "vacancies" ADD CONSTRAINT "FK_vacancies_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
