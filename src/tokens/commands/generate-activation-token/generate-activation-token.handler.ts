import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GenerateActivationTokenCommand } from './generate-activation-token.command';
import { TokensService } from '@/tokens/tokens.service';
import { PinoLogger } from 'nestjs-pino';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { NotFoundException } from '@nestjs/common';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.query';
import { GetUserByEmailQueryResponse } from '@/users/queries/get-user-by-email/get-user-by-email.handler';

@CommandHandler(GenerateActivationTokenCommand)
export class GenerateActivationTokenHandler
  implements ICommandHandler<GenerateActivationTokenCommand>
{
  constructor(
    private readonly queryBus: QueryBus,
    private readonly tokensService: TokensService,
    private readonly logger: PinoLogger,
  ) {}

  async execute(command: GenerateActivationTokenCommand): Promise<string> {
    const { email } = command;

    const user = await this.queryBus.execute<
      GetUserByEmailQuery,
      GetUserByEmailQueryResponse
    >(new GetUserByEmailQuery(email));

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
