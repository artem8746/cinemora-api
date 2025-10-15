import {
  CommandHandler,
  ICommandHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { RegisterCommand } from './register.command';
import { BadRequestException } from '@nestjs/common';
import { hashPassword } from '@/utils/hash-passwords';
import { CreateUserCommand } from '@/users/commands/create-user/create-user.command';
import { GenerateTokensCommand } from '@/tokens/commands/generate-tokens/generate-tokens.command';
import { CreateUserCommandResponse } from '@/users/commands/create-user/create-user.handler';
import { GenerateTokensCommandResponse } from '@/tokens/commands/generate-tokens/generate-tokens.handler';
import { RegisterTokenCommand } from '@/tokens/commands/register-token/register-token.command';
import { RegisterTokenCommandResponse } from '@/tokens/commands/register-token/register-token.handler';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.command';
import { AuthResponse } from '@/auth/types/auth';
import { GetUserByEmailQueryResponse } from '@/users/queries/get-user-by-email/get-user-by-email.handler';

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: RegisterCommand): Promise<AuthResponse> {
    const { email, password } = command;

    const user = await this.queryBus.execute<
      GetUserByEmailQuery,
      GetUserByEmailQueryResponse
    >(new GetUserByEmailQuery(email));

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await this.commandBus.execute<
      CreateUserCommand,
      CreateUserCommandResponse
    >(new CreateUserCommand(email, hashedPassword));

    const jwtSummary = new JwtSummaryDto(newUser);

    const { accessToken, refreshToken } = await this.commandBus.execute<
      GenerateTokensCommand,
      GenerateTokensCommandResponse
    >(new GenerateTokensCommand(jwtSummary));

    await this.commandBus.execute<
      RegisterTokenCommand,
      RegisterTokenCommandResponse
    >(
      new RegisterTokenCommand({
        userId: newUser.id,
        token: refreshToken,
      }),
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}

export type RegisterCommandResponse = ReturnType<RegisterHandler['execute']>;
