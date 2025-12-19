import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { NotificationPayload } from './notification-payload.type';

export interface INotificationStreamPort {
  sendNotification(data: NotificationPayload): void;
  getNotificationStream(userId?: string): Observable<MessageEvent>;
}

export const NOTIFICATION_STREAM_PORT = Symbol('INotificationStreamPort');
