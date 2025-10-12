import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterTokenCommand } from './register-token.command';
import { Token } from '@/tokens/token.entity';
import { TokensService } from '@/tokens/tokens.service';

@CommandHandler(RegisterTokenCommand)
export class RegisterTokenHandler
  implements ICommandHandler<RegisterTokenCommand>
{
  constructor(private readonly tokenService: TokensService) {}

  execute(command: RegisterTokenCommand): Promise<Token> {
    const { createTokenPayload } = command;

    return this.tokenService.registerToken(createTokenPayload);
  }
}

export type RegisterTokenCommandResponse = ReturnType<
  RegisterTokenHandler['execute']
>;
