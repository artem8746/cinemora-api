import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetVacancyNotesByVacancyIdQuery } from './get-vacancy-notes-by-vacancy-id.query';
import { VacancyNotesService } from '../../vacancy-notes.service';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';
import { GetVacancyByIdQuery } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.query';
import { GetVacancyByIdQueryResponse } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.handler';

@QueryHandler(GetVacancyNotesByVacancyIdQuery)
@Injectable()
export class GetVacancyNotesByVacancyIdHandler implements IQueryHandler<GetVacancyNotesByVacancyIdQuery> {
  constructor(
    private readonly vacancyNotesService: VacancyNotesService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetVacancyNotesByVacancyIdQuery,
  ): Promise<VacancyNote[]> {
    const { vacancyId, userId } = query;

    await this.queryBus.execute<
      GetVacancyByIdQuery,
      GetVacancyByIdQueryResponse
    >(new GetVacancyByIdQuery(vacancyId, userId));

    return await this.vacancyNotesService.findNotesByVacancyId({
      vacancyId,
    });
  }
}

export type GetVacancyNotesByVacancyIdQueryResponse = VacancyNote[];
