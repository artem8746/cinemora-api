import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetUserByEmailCommand } from './get-user-by-email.command';
import { UsersService } from '@/users/users.service';

@CommandHandler(GetUserByEmailCommand)
export class GetUserByEmailHandler
  implements ICommandHandler<GetUserByEmailCommand>
{
  constructor(private readonly usersService: UsersService) {}

  execute(command: GetUserByEmailCommand) {
    return this.usersService.findByEmail(command.email);
  }
}
