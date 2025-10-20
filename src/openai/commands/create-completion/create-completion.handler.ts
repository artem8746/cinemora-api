import { ICommandHandler } from '@nestjs/cqrs';
import { CreateCompletionCommand } from './create-completion.command';
import { OpenAIService } from '../../openai.service';

export class CreateCompletionHandler
  implements ICommandHandler<CreateCompletionCommand>
{
  constructor(private readonly openAIService: OpenAIService) {}

  async execute(command: CreateCompletionCommand): Promise<string> {
    return await this.openAIService.createCompletion(command.prompt);
  }
}

export type CreateCompletionCommandResponse = ReturnType<
  CreateCompletionHandler['execute']
>;
