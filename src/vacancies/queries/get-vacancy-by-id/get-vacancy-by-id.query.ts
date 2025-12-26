import { Query } from '@nestjs/cqrs';
import type { Vacancy } from '../../vacancy.entity';

export class GetVacancyByIdQuery extends Query<Vacancy> {
  constructor(
    public readonly vacancyId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
