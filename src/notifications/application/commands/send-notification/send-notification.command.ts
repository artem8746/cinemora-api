import { NotificationPayload } from '../../../domain/notification-payload.type';

export class SendNotificationCommand {
  constructor(
    public readonly data: Omit<NotificationPayload, 'userIds'>,
    public readonly userIds?: string[],
  ) {}
}
