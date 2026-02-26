import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetVacanciesByUserIdQuery } from './get-vacancies-by-user-id.query';
import { VacanciesService } from '../../vacancies.service';

@QueryHandler(GetVacanciesByUserIdQuery)
export class GetVacanciesByUserIdHandler
  implements IQueryHandler<GetVacanciesByUserIdQuery>
{
  constructor(private readonly vacanciesService: VacanciesService) {}

  execute(query: GetVacanciesByUserIdQuery) {
    return this.vacanciesService.findVacanciesByUserId(query.userId);
  }
}

export type GetVacanciesByUserIdQueryResponse = ReturnType<
  GetVacanciesByUserIdHandler['execute']
>;
