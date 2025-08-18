import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const newUser = await this.usersService.createUser(command);

    return newUser;
  }
}

export type CreateUserCommandResponse = User;
