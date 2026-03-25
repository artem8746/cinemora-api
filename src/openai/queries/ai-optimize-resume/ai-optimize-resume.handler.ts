import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { AIOptimizeResumeQuery } from './ai-optimize-resume.query';
import { OpenAIService } from '../../openai.service';
import type { ResumeOptimizationResult } from '@/resume-optimization/presentation/types/resume-analysis';

@QueryHandler(AIOptimizeResumeQuery)
@Injectable()
export class AIOptimizeResumeHandler
  implements IQueryHandler<AIOptimizeResumeQuery>
{
  private readonly logger = new Logger(AIOptimizeResumeHandler.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async execute(
    query: AIOptimizeResumeQuery,
  ): Promise<ResumeOptimizationResult> {
    const { resume, vacancy, options } = query;

    return await this.openAIService.optimizeResumeForVacancy(
      resume,
      vacancy,
      options,
    );
  }
}

export type AIOptimizeResumeQueryResponse = ResumeOptimizationResult;
