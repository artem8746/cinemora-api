import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateProfileCommand } from './update-profile.command';
import { User } from '../../user.entity';
import { UsersService } from '@/users/users.service';
import { PinoLogger } from 'nestjs-pino';
import { SendNotificationCommand } from '@/notifications/application/commands/send-notification/send-notification.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler
  implements ICommandHandler<UpdateProfileCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: PinoLogger,
    private readonly commandBus: CommandBus,
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

    // TODO: remove this after testing
    await this.commandBus.execute(
      new SendNotificationCommand(
        {
          type: 'profile_updated',
          message: 'Profile successfully updated',
          data: {
            updatedFields: Object.keys(updateData),
          },
        },
        [userId],
      ),
    );

    return updatedUser;
  }
}

export type UpdateProfileCommandResponse = ReturnType<
  UpdateProfileHandler['execute']
>;
