import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DeleteVacancyCommand } from './delete-vacancy.command';
import { VacanciesService } from '../../vacancies.service';

@CommandHandler(DeleteVacancyCommand)
@Injectable()
export class DeleteVacancyHandler implements ICommandHandler<DeleteVacancyCommand> {
  constructor(private readonly vacanciesService: VacanciesService) {}

  async execute(command: DeleteVacancyCommand): Promise<void> {
    const { vacancyId, userId } = command;
    await this.vacanciesService.deleteVacancy({ vacancyId, userId });
  }
}

export type DeleteVacancyCommandResponse = void;
