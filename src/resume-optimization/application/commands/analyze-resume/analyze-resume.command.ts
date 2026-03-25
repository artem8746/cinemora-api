export class AnalyzeResumeForVacancyCommand {
  constructor(
    public readonly userId: string,
    public readonly vacancyId: string,
  ) {}
}
