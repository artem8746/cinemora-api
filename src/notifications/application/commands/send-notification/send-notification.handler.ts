import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationsService } from '../../notifications.service';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler
  implements ICommandHandler<SendNotificationCommand>
{
  constructor(private readonly notificationsService: NotificationsService) {}

  execute(command: SendNotificationCommand): Promise<void> {
    const notificationData: Record<string, unknown> =
      typeof command.data === 'object' && command.data !== null
        ? { ...command.data }
        : { message: command.data };

    if (command.userIds && command.userIds.length > 0) {
      notificationData.userIds = command.userIds;
    }

    this.notificationsService.sendNotification(notificationData);
    return Promise.resolve();
  }
}

export type SendNotificationCommandResponse = void;
