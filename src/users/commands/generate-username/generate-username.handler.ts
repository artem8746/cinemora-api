import { Repository } from 'typeorm';
import { User } from '@/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateUsernameCommand } from './generate-username.command';

@CommandHandler(GenerateUsernameCommand)
export class GenerateUsernameHandler
  implements ICommandHandler<GenerateUsernameCommand>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(): Promise<string> {
    const userCount = await this.userRepository.count();
    return `user-${userCount + 1}`;
  }
}

export type GenerateUsernameCommandResponse = ReturnType<
  GenerateUsernameHandler['execute']
>;
