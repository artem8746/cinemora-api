import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UpdateVacancyCommand } from './update-vacancy.command';
import { VacanciesService } from '../../vacancies.service';
import { Vacancy } from '../../vacancy.entity';

@CommandHandler(UpdateVacancyCommand)
@Injectable()
export class UpdateVacancyHandler implements ICommandHandler<UpdateVacancyCommand> {
  constructor(private readonly vacanciesService: VacanciesService) {}

  async execute(command: UpdateVacancyCommand): Promise<Vacancy> {
    const { vacancyId, userId, status, position, url, parsedData } = command;
    return await this.vacanciesService.updateVacancy({
      vacancyId,
      userId,
      updateData: {
        status,
        position,
        url,
        parsedData,
      },
    });
  }
}

export type UpdateVacancyCommandResponse = Vacancy;
