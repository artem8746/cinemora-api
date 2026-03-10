import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseVacancyFromTextCommand } from './parse-vacancy-from-text.command';
import { VacanciesService, ParsedVacancy } from '../../vacancies.service';

@CommandHandler(ParseVacancyFromTextCommand)
export class ParseVacancyFromTextHandler implements ICommandHandler<ParseVacancyFromTextCommand> {
  constructor(private readonly vacanciesService: VacanciesService) {}

  async execute(command: ParseVacancyFromTextCommand): Promise<ParsedVacancy> {
    return await this.vacanciesService.parseVacancyFromText(command.text);
  }
}

export type ParseVacancyFromTextCommandResponse = ParsedVacancy;
