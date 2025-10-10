import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserGoogleCommand } from './create-user.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

@CommandHandler(CreateUserGoogleCommand)
export class CreateUserHandler
  implements ICommandHandler<CreateUserGoogleCommand>
{
  constructor(private readonly usersService: UsersService) {}

  async execute(command: CreateUserGoogleCommand): Promise<User> {
    const newUser = await this.usersService.create(command);

    return newUser;
  }
}

export type CreateUserCommandResponse = User;
