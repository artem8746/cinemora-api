import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { ParseVacancyHandler } from './commands/parse-vacancy/parse-vacancy.handler';
import { ParseVacancyFromTextHandler } from './commands/parse-vacancy-from-text/parse-vacancy-from-text.handler';
import { SaveVacancyHandler } from './commands/save-vacancy/save-vacancy.handler';
import { DeleteVacancyHandler } from './commands/delete-vacancy/delete-vacancy.handler';
import { UpdateVacancyHandler } from './commands/update-vacancy/update-vacancy.handler';
import { GetVacanciesByUserIdHandler } from './queries/get-vacancies-by-user-id/get-vacancies-by-user-id.handler';
import { GetVacancyByIdHandler } from './queries/get-vacancy-by-id/get-vacancy-by-id.handler';
import { Vacancy } from './vacancy.entity';
import { CompaniesModule } from '@/companies/companies.module';

export const CommandHandlers = [
  ParseVacancyHandler,
  ParseVacancyFromTextHandler,
  SaveVacancyHandler,
  DeleteVacancyHandler,
  UpdateVacancyHandler,
];

export const QueryHandlers = [
  GetVacanciesByUserIdHandler,
  GetVacancyByIdHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Vacancy]), CompaniesModule],
  controllers: [VacanciesController],
  providers: [VacanciesService, ...CommandHandlers, ...QueryHandlers],
  exports: [VacanciesService, ...QueryHandlers],
})
export class VacanciesModule {}
