import { Injectable, Inject } from '@nestjs/common';
import {
  INotificationStreamPort,
  NOTIFICATION_STREAM_PORT,
} from '../domain/notification-stream.port';
import { NotificationPayload } from '../domain/notification-payload.type';
import { Notification } from '../notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_STREAM_PORT)
    private readonly notificationStreamPort: INotificationStreamPort,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  sendNotification(data: NotificationPayload): void {
    this.notificationStreamPort.sendNotification(data);
  }

  getUserNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({ where: { userId } });
  }
}
