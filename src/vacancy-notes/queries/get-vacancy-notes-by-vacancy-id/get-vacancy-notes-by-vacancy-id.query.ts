import { Query } from '@nestjs/cqrs';
import type { VacancyNote } from '@/vacancies/vacancy-note.entity';

export class GetVacancyNotesByVacancyIdQuery extends Query<VacancyNote[]> {
  constructor(
    public readonly vacancyId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
