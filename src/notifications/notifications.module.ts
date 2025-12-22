import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './application/notifications.service';
import { SseNotificationStreamService } from './infrastructure/sse-notification-stream.service';
import { SendNotificationHandler } from './application/commands/send-notification/send-notification.handler';
import { NOTIFICATION_STREAM_PORT } from './domain/notification-stream.port';
import { RedisModule } from '@/redis/redis.module';
import { Notification } from './notification.entity';

export const CommandHandlers = [SendNotificationHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), CqrsModule, RedisModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NOTIFICATION_STREAM_PORT,
      useClass: SseNotificationStreamService,
    },
    ...CommandHandlers,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
