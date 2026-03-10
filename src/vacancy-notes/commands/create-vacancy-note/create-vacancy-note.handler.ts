import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CreateVacancyNoteCommand } from './create-vacancy-note.command';
import { VacancyNotesService } from '../../vacancy-notes.service';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';
import { GetVacancyByIdQuery } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.query';
import { GetVacancyByIdQueryResponse } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.handler';

@CommandHandler(CreateVacancyNoteCommand)
@Injectable()
export class CreateVacancyNoteHandler implements ICommandHandler<CreateVacancyNoteCommand> {
  constructor(
    private readonly vacancyNotesService: VacancyNotesService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: CreateVacancyNoteCommand): Promise<VacancyNote> {
    const { vacancyId, userId, type, title, content } = command;

    await this.queryBus.execute<
      GetVacancyByIdQuery,
      GetVacancyByIdQueryResponse
    >(new GetVacancyByIdQuery(vacancyId, userId));

    return await this.vacancyNotesService.createNote({
      vacancyId,
      type,
      title,
      content,
    });
  }
}

export type CreateVacancyNoteCommandResponse = VacancyNote;
