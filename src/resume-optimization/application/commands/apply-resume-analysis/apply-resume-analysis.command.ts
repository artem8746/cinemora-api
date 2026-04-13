export class ApplyResumeAnalysisCommand {
  constructor(
    public readonly userId: string,
    public readonly analysisId: string,
    public readonly appliedAtsScore: number,
    public readonly appliedMatchScore: number,
  ) {}
}
