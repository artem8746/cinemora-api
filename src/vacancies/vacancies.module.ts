import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { VacanciesService } from './vacancies.service';
import { VacanciesController } from './vacancies.controller';
import { ParseVacancyHandler } from './commands/parse-vacancy/parse-vacancy.handler';
import { OpenAIModule } from '@/openai/openai.module';

export const CommandHandlers = [ParseVacancyHandler];

@Module({
  imports: [CqrsModule, OpenAIModule],
  controllers: [VacanciesController],
  providers: [VacanciesService, ...CommandHandlers],
  exports: [VacanciesService],
})
export class VacanciesModule {}
