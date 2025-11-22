import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { User } from '../../user.entity';
import { UsersService } from '@/users/users.service';
import { PinoLogger } from 'nestjs-pino';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(UpdateProfileHandler.name);
  }

  async execute(command: UpdateProfileCommand): Promise<User> {
    const { userId, updateData } = command;

    const user = await this.usersService.findById(userId);

    if (!user) {
      this.logger.error('User not found', { userId });
      throw new NotFoundException('User not found');
    }

    await this.usersService.updateUser(userId, updateData);

    const updatedUser = await this.usersService.findById(userId);

    if (!updatedUser) {
      this.logger.error('User not found after update', { userId });
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }
}

export type UpdateProfileCommandResponse = ReturnType<
  UpdateProfileHandler['execute']
>;
