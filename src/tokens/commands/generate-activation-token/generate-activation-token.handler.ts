import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateActivationTokenCommand } from './generate-activation-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { PinoLogger } from 'nestjs-pino';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { User } from '@/users/user.entity';
import { GetUserByEmailCommand } from '@/users/commands/get-user-by-email/get-user-by-email.command';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(GenerateActivationTokenCommand)
export class GenerateActivationTokenHandler
  implements ICommandHandler<GenerateActivationTokenCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly tokensService: TokensService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: GenerateActivationTokenCommand): Promise<string> {
    const { email } = command;

    const user = await this.commandBus.execute<GetUserByEmailCommand, User>(
      new GetUserByEmailCommand(email),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activationToken = await this.tokensService.createActivationToken(
      new JwtSummaryDto(user),
    );

    this.logger.info(
      `Activation token generated for user: ${user.id}`,
      GenerateActivationTokenHandler.name,
    );

    return activationToken;
  }
}

export type GenerateActivationTokenCommandResponse = string;
