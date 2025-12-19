import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OpenAIService } from './openai.service';
import { ParseTextToResumeHandler } from './commands/parse-text-to-resume/parse-text-to-resume.handler';
import { ParseVacancyHandler } from './queries/parse-vacancy/parse-vacancy.handler';

export const CommandHandlers = [ParseTextToResumeHandler];
export const QueryHandlers = [ParseVacancyHandler];

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [OpenAIService, ...CommandHandlers, ...QueryHandlers],
  exports: [OpenAIService, ...QueryHandlers],
})
export class OpenAIModule {}
