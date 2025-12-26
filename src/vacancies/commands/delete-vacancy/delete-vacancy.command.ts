export class DeleteVacancyCommand {
  public readonly vacancyId: string;
  public readonly userId: string;

  constructor(vacancyId: string, userId: string) {
    this.vacancyId = vacancyId;
    this.userId = userId;
  }
}
