import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenAIModule } from '@/openai/openai.module';
import { CompanySource } from './company-source.entity';
import { Company } from './company.entity';
import { COMPANY_PROFILE_SUMMARIZER_PORT } from './domain/company-profile-summarizer.port';
import { COMPANY_WEBSITE_CONTEXT_PORT } from './domain/company-website-context.port';
import { JinaCompanyWebsiteContextAdapter } from './infrastructure/jina-company-website-context.adapter';
import { OpenAICompanyProfileSummarizerAdapter } from './infrastructure/openai-company-profile-summarizer.adapter';
import { CompaniesService } from './companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanySource]), OpenAIModule],
  providers: [
    CompaniesService,
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
