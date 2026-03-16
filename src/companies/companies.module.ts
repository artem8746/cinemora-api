import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAIModule } from '@/openai/openai.module';
import { RedisModule } from '@/redis/redis.module';
import { CompanySource } from './company-source.entity';
import { Company } from './company.entity';
import { COMPANY_PROFILE_SUMMARIZER_PORT } from './domain/company-profile-summarizer.port';
import { COMPANY_WEBSITE_CONTEXT_PORT } from './domain/company-website-context.port';
import { JinaCompanyWebsiteContextAdapter } from './infrastructure/jina-company-website-context.adapter';
import { OpenAICompanyProfileSummarizerAdapter } from './infrastructure/openai-company-profile-summarizer.adapter';
import { CompaniesService } from './companies.service';
import { ResolveCompanyForVacancyHandler } from './commands/resolve-company-for-vacancy/resolve-company-for-vacancy.handler';
import { EnqueueCompanyEnrichmentHandler } from './commands/enqueue-company-enrichment/enqueue-company-enrichment.handler';
import { CleanupCompanySourcesJob } from './jobs/cleanup-company-sources.job';

const CommandHandlers = [
  ResolveCompanyForVacancyHandler,
  EnqueueCompanyEnrichmentHandler,
];

@Module({
  imports: [
    CqrsModule,
    RedisModule,
    TypeOrmModule.forFeature([Company, CompanySource]),
    OpenAIModule,
  ],
  providers: [
    CompaniesService,
    CleanupCompanySourcesJob,
    ...CommandHandlers,
    OpenAICompanyProfileSummarizerAdapter,
    JinaCompanyWebsiteContextAdapter,
    {
      provide: COMPANY_PROFILE_SUMMARIZER_PORT,
      useExisting: OpenAICompanyProfileSummarizerAdapter,
    },
    {
      provide: COMPANY_WEBSITE_CONTEXT_PORT,
      useExisting: JinaCompanyWebsiteContextAdapter,
    },
  ],
  exports: [CompaniesService],
})
export class CompaniesModule {}
