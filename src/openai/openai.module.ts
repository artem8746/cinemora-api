import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { OpenAIService } from './openai.service';
import { CreateCompletionHandler } from './commands/create-completion/create-completion.handler';

@Module({
  imports: [ConfigModule, CqrsModule],
  providers: [OpenAIService, CreateCompletionHandler],
  exports: [OpenAIService],
})
export class OpenAIModule {}
