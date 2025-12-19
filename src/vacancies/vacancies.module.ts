import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { ParseVacancyHandler } from './commands/parse-vacancy/parse-vacancy.handler';
import { ParseVacancyFromTextHandler } from './commands/parse-vacancy-from-text/parse-vacancy-from-text.handler';
import { SaveVacancyHandler } from './commands/save-vacancy/save-vacancy.handler';
import { GetVacanciesByUserIdHandler } from './queries/get-vacancies-by-user-id/get-vacancies-by-user-id.handler';
import { Vacancy } from './vacancy.entity';

export const CommandHandlers = [
  ParseVacancyHandler,
  ParseVacancyFromTextHandler,
  SaveVacancyHandler,
];

export const QueryHandlers = [GetVacanciesByUserIdHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Vacancy])],
  controllers: [VacanciesController],
  providers: [VacanciesService, ...CommandHandlers, ...QueryHandlers],
  exports: [VacanciesService],
})
export class VacanciesModule {}
