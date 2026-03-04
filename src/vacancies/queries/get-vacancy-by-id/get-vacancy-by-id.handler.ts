import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetVacancyByIdQuery } from './get-vacancy-by-id.query';
import { VacanciesService } from '../../vacancies.service';
import { Vacancy } from '../../vacancy.entity';

@QueryHandler(GetVacancyByIdQuery)
@Injectable()
export class GetVacancyByIdHandler
  implements IQueryHandler<GetVacancyByIdQuery>
{
  constructor(private readonly vacanciesService: VacanciesService) {}

  async execute(query: GetVacancyByIdQuery): Promise<Vacancy> {
    const { vacancyId, userId } = query;
    return await this.vacanciesService.findVacancyById({ vacancyId, userId });
  }
}

export type GetVacancyByIdQueryResponse = Vacancy;
