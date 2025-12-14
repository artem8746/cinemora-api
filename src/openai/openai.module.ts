import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OpenAIService } from './openai.service';
import { ParseTextToResumeHandler } from './commands/parse-text-to-resume/parse-text-to-resume.handler';

export const CommandHandlers = [ParseTextToResumeHandler];

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [OpenAIService, ...CommandHandlers],
  exports: [OpenAIService],
})
export class OpenAIModule {}
