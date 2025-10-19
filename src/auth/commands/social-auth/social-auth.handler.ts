import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { SocialAuthCommand } from './social-auth.command';
import { GetUserByEmailQuery } from '@/users/queries/get-user-by-email/get-user-by-email.command';
import { AuthResponse } from '@/auth/types/auth';
import { JwtSummaryDto } from '@/auth/dto/jwt-summary.dto';
import { GenerateTokensCommand } from '@/tokens/commands/generate-tokens/generate-tokens.command';
import { User } from '@/users/user.entity';
import {
  CreateUserSocialCommand,
  CreateUserSocialParams,
} from '@/users/commands/create-user-social/create-user-social.command';
import { GenerateUsernameCommand } from '@/users/commands/generate-username/generate-username.command';

@CommandHandler(SocialAuthCommand)
export class SocialAuthHandler implements ICommandHandler<SocialAuthCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: SocialAuthCommand): Promise<AuthResponse> {
    const { user } = command;

    const existingUser = await this.findUserByEmail(user.email);

    const userName =
      user.username ??
      (await this.commandBus.execute(new GenerateUsernameCommand()));

    const targetUser =
      existingUser ??
      (await this.createNewUser({
        ...user,
        username: userName,
      }));

    return this.generateTokensForUser(targetUser);
  }

  private findUserByEmail(email: string): Promise<User | null> {
    return this.queryBus.execute(new GetUserByEmailQuery(email));
  }

  private createNewUser(params: CreateUserSocialParams): Promise<User> {
    return this.commandBus.execute(new CreateUserSocialCommand(params));
  }

  private generateTokensForUser(user: User): Promise<AuthResponse> {
    const jwtSummary = new JwtSummaryDto(user);
    return this.commandBus.execute(new GenerateTokensCommand(jwtSummary));
  }
}

export type SocialAuthCommandResponse = ReturnType<
  SocialAuthHandler['execute']
>;
