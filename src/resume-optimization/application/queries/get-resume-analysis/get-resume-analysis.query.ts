import { Query } from '@nestjs/cqrs';
import { ResumeAnalysis } from '@/resume-optimization/resume-analysis.entity';

export class GetResumeAnalysisQuery extends Query<ResumeAnalysis | null> {
  constructor(
    public readonly userId: string,
    public readonly vacancyId: string,
  ) {
    super();
  }
}
