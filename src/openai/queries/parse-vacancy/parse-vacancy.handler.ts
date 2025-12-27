import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ParseVacancyQuery } from './parse-vacancy.query';
import { OpenAIService } from '../../openai.service';

@QueryHandler(ParseVacancyQuery)
export class ParseVacancyHandler implements IQueryHandler<ParseVacancyQuery> {
  constructor(private readonly openAIService: OpenAIService) {}

  async execute(query: ParseVacancyQuery) {
    return await this.openAIService.parseVacancy(query.content);
  }
}

export type ParseVacancyQueryResponse = ReturnType<
  ParseVacancyHandler['execute']
>;
