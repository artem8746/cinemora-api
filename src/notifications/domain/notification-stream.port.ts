import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

export interface INotificationStreamPort {
  sendNotification(data: unknown): void;
  getNotificationStream(userId?: string): Observable<MessageEvent>;
}

export const NOTIFICATION_STREAM_PORT = Symbol('INotificationStreamPort');
