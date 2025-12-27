import { ParsedVacancyResponse } from '@/openai/types/parsed-vacancy.type';
import { Query } from '@nestjs/cqrs';

export class ParseVacancyQuery extends Query<ParsedVacancyResponse> {
  constructor(public readonly content: string) {
    super();
  }
}
