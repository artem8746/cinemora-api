import { Query } from '@nestjs/cqrs';
import type { ParsedResume } from '@/resume/presentation/types/resume';
import type { ParsedVacancyData } from '../../types/parsed-vacancy.type';
import type { ResumeOptimizationResult } from '@/resume-optimization/presentation/types/resume-analysis';
import type { ResumeOptimizationOptions } from '../../constants/prompts/resume-optimization.prompt';

export class AIOptimizeResumeQuery extends Query<ResumeOptimizationResult> {
  constructor(
    public readonly resume: ParsedResume,
    public readonly vacancy: ParsedVacancyData,
    public readonly options: ResumeOptimizationOptions,
  ) {
    super();
  }
}
