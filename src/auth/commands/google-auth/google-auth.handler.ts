import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { GoogleAuthCommand } from './google-auth.command';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.command';
import { AuthResponse } from '@/auth/types/auth';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { GenerateTokensCommand } from '@/tokens/commands/generate-tokens/generate-tokens.command';
import { CreateUserCommand } from '@/users/commands/create-user/create-user.command';
import { User } from '@/users/user.entity';

@CommandHandler(GoogleAuthCommand)
export class GoogleAuthHandler implements ICommandHandler<GoogleAuthCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: GoogleAuthCommand): Promise<AuthResponse> {
    const { user } = command;

    const existingUser = await this.findUserByEmail(user.email);

    const username = user.firstName + ' ' + user.lastName;

    const targetUser =
      existingUser ?? (await this.createNewUser(user.email, username));

    return this.generateTokensForUser(targetUser);
  }

  private findUserByEmail(email: string): Promise<User | null> {
    return this.queryBus.execute(new GetUserByEmailQuery(email));
  }

  private createNewUser(email: string, username: string): Promise<User> {
    return this.commandBus.execute(new CreateUserCommand(email, username));
  }

  private generateTokensForUser(user: User): Promise<AuthResponse> {
    const jwtSummary = new JwtSummaryDto(user);
    return this.commandBus.execute(new GenerateTokensCommand(jwtSummary));
  }
}

export type GoogleAuthCommandResponse = ReturnType<
  GoogleAuthHandler['execute']
>;
