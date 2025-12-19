import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SaveVacancyCommand } from './save-vacancy.command';
import { Vacancy } from '../../vacancy.entity';
import { VacanciesService } from '../../vacancies.service';
import { GetUserByIdQuery } from '@/users/queries/get-user-by-id/get-user-by-id.query';
import { GetUserByIdQueryResponse } from '@/users/queries/get-user-by-id/get-user-by-id.handler';
import { User } from '@/users/user.entity';

@CommandHandler(SaveVacancyCommand)
@Injectable()
export class SaveVacancyHandler implements ICommandHandler<SaveVacancyCommand> {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: SaveVacancyCommand): Promise<Vacancy> {
    const { url, parsedData, userId } = command;

    const userResult: User | null = await this.queryBus.execute<
      GetUserByIdQuery,
      GetUserByIdQueryResponse
    >(new GetUserByIdQuery(userId));

    if (!userResult) {
      throw new NotFoundException(`User with ID not found: ${userId}`);
    }

    return this.vacanciesService.saveVacancy(url, parsedData, userResult);
  }
}

export type SaveVacancyCommandResponse = Vacancy;
