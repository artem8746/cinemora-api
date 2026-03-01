import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPasswordTokenCommand } from './reset-password-token.command';
import { TokensService } from '@/tokens/tokens.service';

@CommandHandler(ResetPasswordTokenCommand)
export class ResetPasswordTokenHandler
  implements ICommandHandler<ResetPasswordTokenCommand>
{
  constructor(private readonly tokenService: TokensService) {}

  execute(command: ResetPasswordTokenCommand): Promise<string> {
    const { payload } = command;

    return this.tokenService.createResetPasswordToken(payload);
  }
}

export type ResetPasswordTokenCommandResponse = ReturnType<
  ResetPasswordTokenHandler['execute']
>;
