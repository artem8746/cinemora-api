import { Query } from '@nestjs/cqrs';
import type { VacanciesByStatusDto } from '../../dto/vacancies-by-status.dto';

export class GetVacanciesByUserIdQuery extends Query<VacanciesByStatusDto> {
  constructor(public readonly userId: string) {
    super();
  }
}
