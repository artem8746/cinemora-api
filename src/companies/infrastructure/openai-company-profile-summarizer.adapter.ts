import { Injectable } from '@nestjs/common';
import { OpenAIService } from '@/openai/openai.service';
import { CompanyProfileSummarizerPort } from '@/companies/domain/company-profile-summarizer.port';

@Injectable()
export class OpenAICompanyProfileSummarizerAdapter implements CompanyProfileSummarizerPort {
  constructor(private readonly openAIService: OpenAIService) {}

  async summarize(params: {
    companyName: string;
    vacancyText: string;
    websiteContent: string | null;
  }) {
    return await this.openAIService.summarizeCompanyProfile(params);
  }
}
