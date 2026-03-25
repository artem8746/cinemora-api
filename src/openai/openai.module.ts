import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OpenAIService } from './openai.service';
import { ParseTextToResumeHandler } from './commands/parse-text-to-resume/parse-text-to-resume.handler';
import { ParseVacancyHandler } from './queries/parse-vacancy/parse-vacancy.handler';
import { AICompareResumeWithVacancyHandler } from './queries/ai-compare-resume-with-vacancy/ai-compare-resume-with-vacancy.handler';
import { AIOptimizeResumeHandler } from './queries/ai-optimize-resume/ai-optimize-resume.handler';

export const CommandHandlers = [ParseTextToResumeHandler];
export const QueryHandlers = [
  ParseVacancyHandler,
  AICompareResumeWithVacancyHandler,
  AIOptimizeResumeHandler,
];

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [OpenAIService, ...CommandHandlers, ...QueryHandlers],
  exports: [OpenAIService, ...QueryHandlers],
})
export class OpenAIModule {}
