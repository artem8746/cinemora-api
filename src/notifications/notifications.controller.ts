import {
  Controller,
  MessageEvent,
  Sse,
  Inject,
  Query,
  Get,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  INotificationStreamPort,
  NOTIFICATION_STREAM_PORT,
} from './domain/notification-stream.port';
import { NotificationsService } from './application/notifications.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { CommonResponses } from '@/utils/swagger.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notifications')
export class NotificationsController {
  constructor(
    @Inject(NOTIFICATION_STREAM_PORT)
    private readonly notificationStreamPort: INotificationStreamPort,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Sse('stream')
  sendEvents(@Query('userId') userId?: string): Observable<MessageEvent> {
    return this.notificationStreamPort.getNotificationStream(userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user notifications' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  getUserNotifications(@CurrentUserId() userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }
}
