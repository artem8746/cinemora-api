import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateVacancyNoteCommand } from './update-vacancy-note.command';
import { VacancyNotesService } from '../../vacancy-notes.service';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';

@CommandHandler(UpdateVacancyNoteCommand)
@Injectable()
export class UpdateVacancyNoteHandler implements ICommandHandler<UpdateVacancyNoteCommand> {
  constructor(private readonly vacancyNotesService: VacancyNotesService) {}

  async execute(command: UpdateVacancyNoteCommand): Promise<VacancyNote> {
    const { noteId, userId, type, title, content } = command;
    return await this.vacancyNotesService.updateNote({
      noteId,
      userId,
      updateData: {
        type,
        title,
        content,
      },
    });
  }
}

export type UpdateVacancyNoteCommandResponse = VacancyNote;
