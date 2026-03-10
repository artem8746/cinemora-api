import type { CompanyProfileDto } from '@/openai/types/company-profile.type';

export const COMPANY_PROFILE_SUMMARIZER_PORT = Symbol(
  'COMPANY_PROFILE_SUMMARIZER_PORT',
);

export interface CompanyProfileSummarizerPort {
  summarize(params: {
    companyName: string;
    vacancyText: string;
    websiteContent: string | null;
  }): Promise<CompanyProfileDto>;
}
