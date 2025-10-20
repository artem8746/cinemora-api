import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserSocialCommand } from './create-user-social.command';
import { User } from '@/users/user.entity';
import { UsersService } from '@/users/users.service';

@CommandHandler(CreateUserSocialCommand)
export class CreateUserSocialHandler
  implements ICommandHandler<CreateUserSocialCommand>
{
  constructor(private readonly usersService: UsersService) {}

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

    return newUser;
  }
}

export type CreateUserSocialCommandResponse = User;
