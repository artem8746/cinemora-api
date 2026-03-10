import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteVacancyNoteCommand } from './delete-vacancy-note.command';
import { VacancyNotesService } from '../../vacancy-notes.service';

@CommandHandler(DeleteVacancyNoteCommand)
@Injectable()
export class DeleteVacancyNoteHandler implements ICommandHandler<DeleteVacancyNoteCommand> {
  constructor(private readonly vacancyNotesService: VacancyNotesService) {}

  async execute(command: DeleteVacancyNoteCommand): Promise<void> {
    const { noteId, userId } = command;
    await this.vacancyNotesService.deleteNote({
      noteId,
      userId,
    });
  }
}

export type DeleteVacancyNoteCommandResponse = void;
