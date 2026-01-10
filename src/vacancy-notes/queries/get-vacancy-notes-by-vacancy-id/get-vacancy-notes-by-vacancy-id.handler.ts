import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetVacancyNotesByVacancyIdQuery } from './get-vacancy-notes-by-vacancy-id.query';
import { VacancyNotesService } from '../../vacancy-notes.service';
import { VacancyNote } from '@/vacancies/vacancy-note.entity';

@QueryHandler(GetVacancyNotesByVacancyIdQuery)
@Injectable()
export class GetVacancyNotesByVacancyIdHandler implements IQueryHandler<GetVacancyNotesByVacancyIdQuery> {
  constructor(private readonly vacancyNotesService: VacancyNotesService) {}

  async execute(
    query: GetVacancyNotesByVacancyIdQuery,
  ): Promise<VacancyNote[]> {
    const { vacancyId, userId } = query;
    return await this.vacancyNotesService.findNotesByVacancyId({
      vacancyId,
      userId,
    });
  }
}

export type GetVacancyNotesByVacancyIdQueryResponse = VacancyNote[];
