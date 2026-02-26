import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseVacancyCommand } from './parse-vacancy.command';
import { VacanciesService, ParsedVacancy } from '../../vacancies.service';

@CommandHandler(ParseVacancyCommand)
export class ParseVacancyHandler
  implements ICommandHandler<ParseVacancyCommand>
{
  constructor(private readonly vacanciesService: VacanciesService) {}

  async execute(command: ParseVacancyCommand): Promise<ParsedVacancy> {
    return await this.vacanciesService.parseVacancy(command.url);
  }
}

export type ParseVacancyCommandResponse = ParsedVacancy;
