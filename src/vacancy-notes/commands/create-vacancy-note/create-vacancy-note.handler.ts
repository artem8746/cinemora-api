import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateVacancyNoteCommand } from './create-vacancy-note.command';
import { VacancyNotesService } from '../../vacancy-notes.service';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';

@CommandHandler(CreateVacancyNoteCommand)
@Injectable()
export class CreateVacancyNoteHandler implements ICommandHandler<CreateVacancyNoteCommand> {
  constructor(private readonly vacancyNotesService: VacancyNotesService) {}

  async execute(command: CreateVacancyNoteCommand): Promise<VacancyNote> {
    const { vacancyId, userId, type, title, content } = command;
    return await this.vacancyNotesService.createNote({
      vacancyId,
      userId,
      type,
      title,
      content,
    });
  }
}

export type CreateVacancyNoteCommandResponse = VacancyNote;
