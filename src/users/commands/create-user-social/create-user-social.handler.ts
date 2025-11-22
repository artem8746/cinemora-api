import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { CreateUserSocialCommand } from './create-user-social.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';
import { CreateDefaultSettingsCommand } from '@/settings/commands/create-default-settings/create-default-settings.command';
import { CreateDefaultSettingsCommandResponse } from '@/settings/commands/create-default-settings/create-default-settings.handler';

@CommandHandler(CreateUserSocialCommand)
export class CreateUserSocialHandler
  implements ICommandHandler<CreateUserSocialCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateUserSocialCommand): Promise<User> {
    const { params } = command;

    const userData = {
      email: params.email,
      username: params.username,
      avatar: params.picture,
      credits: 0,
      isConfirmed: true,
    };

    const newUser = await this.usersService.create(userData);

    await this.commandBus.execute<
      CreateDefaultSettingsCommand,
      CreateDefaultSettingsCommandResponse
    >(new CreateDefaultSettingsCommand(newUser.id));

    return newUser;
  }
}

export type CreateUserSocialCommandResponse = User;
