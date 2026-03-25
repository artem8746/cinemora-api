import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetResumeAnalysisQuery } from './get-resume-analysis.query';
import { ResumeOptimizationService } from '../../resume-optimization.service';
import { ResumeAnalysis } from '@/resume-optimization/resume-analysis.entity';

@QueryHandler(GetResumeAnalysisQuery)
@Injectable()
export class GetResumeAnalysisHandler implements IQueryHandler<GetResumeAnalysisQuery> {
  constructor(
    private readonly resumeOptimizationService: ResumeOptimizationService,
  ) {}

  async execute(query: GetResumeAnalysisQuery): Promise<ResumeAnalysis | null> {
    const { userId, vacancyId } = query;
    return await this.resumeOptimizationService.findByUserAndVacancy(
      userId,
      vacancyId,
    );
  }
}

export type GetResumeAnalysisQueryResponse = ResumeAnalysis | null;
