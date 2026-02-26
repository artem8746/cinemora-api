import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { AICompareResumeWithVacancyQuery } from './ai-compare-resume-with-vacancy.query';
import { OpenAIService } from '../../openai.service';
import type { ResumeMatchResponseDto } from '@/resume/presentation/dto/compare-resume.dto';

@QueryHandler(AICompareResumeWithVacancyQuery)
@Injectable()
export class AICompareResumeWithVacancyHandler
  implements IQueryHandler<AICompareResumeWithVacancyQuery>
{
  private readonly logger = new Logger(AICompareResumeWithVacancyHandler.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async execute(
    query: AICompareResumeWithVacancyQuery,
  ): Promise<ResumeMatchResponseDto> {
    const { resume, vacancy } = query;

    return await this.openAIService.compareResumeWithVacancy(resume, vacancy);
  }
}

export type AICompareResumeWithVacancyQueryResponse = ResumeMatchResponseDto;
