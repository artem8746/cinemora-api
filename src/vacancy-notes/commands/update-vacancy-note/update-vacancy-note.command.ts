import { VacancyNoteType } from '@/vacancies/enums/vacancy-note-type.enum';

export interface UpdateVacancyNoteCommandPayload {
  noteId: string;
  userId: string;
  type?: VacancyNoteType;
  title?: string | null;
  content?: string;
}

export class UpdateVacancyNoteCommand {
  public readonly noteId: string;
  public readonly userId: string;
  public readonly type?: VacancyNoteType;
  public readonly title?: string | null;
  public readonly content?: string;

  constructor(payload: UpdateVacancyNoteCommandPayload) {
    this.noteId = payload.noteId;
    this.userId = payload.userId;
    this.type = payload.type;
    this.title = payload.title;
    this.content = payload.content;
  }
}
