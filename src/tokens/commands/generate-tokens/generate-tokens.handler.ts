import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateTokensCommand } from './generate-tokens.command';
import { TokensService } from '@/tokens/tokens.service';

@CommandHandler(GenerateTokensCommand)
export class GenerateTokensHandler
  implements ICommandHandler<GenerateTokensCommand>
{
  constructor(private readonly tokenService: TokensService) {}

  execute(command: GenerateTokensCommand): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { payload } = command;

    return this.tokenService.generateTokens(payload);
  }
}

export type GenerateTokensCommandResponse = ReturnType<
  GenerateTokensHandler['execute']
>;
