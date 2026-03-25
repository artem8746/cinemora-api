import { ResumeAnalysisStatus } from '@/resume-optimization/presentation/types/resume-analysis';

export class UpdateResumeAnalysisStatusCommand {
  constructor(
    public readonly userId: string,
    public readonly analysisId: string,
    public readonly status: ResumeAnalysisStatus,
  ) {}
}
