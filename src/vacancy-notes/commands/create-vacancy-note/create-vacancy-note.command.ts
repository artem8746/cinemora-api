import { VacancyNoteType } from '@/vacancies/enums/vacancy-note-type.enum';

export interface CreateVacancyNoteCommandPayload {
  vacancyId: string;
  userId: string;
  type: VacancyNoteType;
  title?: string | null;
  content: string;
}

export class CreateVacancyNoteCommand {
  public readonly vacancyId: string;
  public readonly userId: string;
  public readonly type: VacancyNoteType;
  public readonly title?: string | null;
  public readonly content: string;

  constructor(payload: CreateVacancyNoteCommandPayload) {
    this.vacancyId = payload.vacancyId;
    this.userId = payload.userId;
    this.type = payload.type;
    this.title = payload.title;
    this.content = payload.content;
  }
}
