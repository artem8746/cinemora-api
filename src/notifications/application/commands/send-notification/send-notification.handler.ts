import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationsService } from '../../notifications.service';
import { NotificationPayload } from '../../../domain/notification-payload.type';

@CommandHandler(SendNotificationCommand)
export class SendNotificationHandler implements ICommandHandler<SendNotificationCommand> {
  constructor(private readonly notificationsService: NotificationsService) {}

  execute(command: SendNotificationCommand): Promise<void> {
    const notificationPayload: NotificationPayload = {
      ...command.data,
      userIds: command.userIds,
    };

    this.notificationsService.sendNotification(notificationPayload);
    return Promise.resolve();
  }
}

export type SendNotificationCommandResponse = void;
