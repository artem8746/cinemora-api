import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';
import { CreateDefaultSettingsCommand } from '@/settings/commands/create-default-settings/create-default-settings.command';
import { CreateDefaultSettingsCommandResponse } from '@/settings/commands/create-default-settings/create-default-settings.handler';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const newUser = await this.usersService.create(command);

    await this.commandBus.execute<
      CreateDefaultSettingsCommand,
      CreateDefaultSettingsCommandResponse
    >(new CreateDefaultSettingsCommand(newUser.id));

    return newUser;
  }
}

export type CreateUserCommandResponse = User;
