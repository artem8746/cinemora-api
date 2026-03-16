export interface DeleteVacancyNoteCommandPayload {
  noteId: string;
  userId: string;
}

export class DeleteVacancyNoteCommand {
  public readonly noteId: string;
  public readonly userId: string;

  constructor(payload: DeleteVacancyNoteCommandPayload) {
    this.noteId = payload.noteId;
    this.userId = payload.userId;
  }
}
