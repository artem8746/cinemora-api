import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import Redis from 'ioredis';
import { INotificationStreamPort } from '../domain/notification-stream.port';
import { NotificationPayload } from '../domain/notification-payload.type';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SseNotificationStreamService
  implements INotificationStreamPort, OnModuleInit, OnModuleDestroy
{
  private readonly notificationSubject = new Subject<MessageEvent>();
  private readonly userStreams = new Map<string, Subject<MessageEvent>>();
  private readonly subscribedChannels = new Set<string>();
  private readonly publisherClient: Redis;
  private readonly subscriberClient: Redis;

  private readonly NOTIFICATION_CHANNEL = 'notifications';
  private readonly USER_CHANNEL_PREFIX = 'notifications:user:';

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SseNotificationStreamService.name);
    this.publisherClient = this.createPublisherClient();
    this.subscriberClient = this.createSubscriberClient();
  }

  async onModuleInit(): Promise<void> {
    await this.subscribeToChannel(this.NOTIFICATION_CHANNEL);
    this.setupMessageHandler();
  }

  async onModuleDestroy(): Promise<void> {
    await this.unsubscribeFromAllChannels();
    await this.publisherClient.quit();
    await this.subscriberClient.quit();
    this.cleanupStreams();
  }

  sendNotification(data: NotificationPayload): void {
    const { message, userIds } = this.parseNotificationData(data);
    this.publishToChannels(message, userIds);
  }

  getNotificationStream(userId?: string): Observable<MessageEvent> {
    if (!userId) {
      return this.notificationSubject.asObservable();
    }

    return this.getOrCreateUserStream(userId);
  }

  private createPublisherClient(): Redis {
    const redisHost = this.configService.getOrThrow('redis.host');
    const redisPort = this.configService.getOrThrow('redis.port');

    return new Redis({
      host: redisHost,
      port: redisPort,
    });
  }

  private createSubscriberClient(): Redis {
    const redisHost = this.configService.getOrThrow('redis.host');
    const redisPort = this.configService.getOrThrow('redis.port');

    return new Redis({
      host: redisHost,
      port: redisPort,
    });
  }

  private async subscribeToChannel(channel: string): Promise<void> {
    await this.subscriberClient.subscribe(channel);
    this.subscribedChannels.add(channel);
  }

  private async unsubscribeFromAllChannels(): Promise<void> {
    if (this.subscribedChannels.size === 0) {
      return;
    }

    await this.subscriberClient.unsubscribe(
      ...Array.from(this.subscribedChannels),
    );
  }

  private setupMessageHandler(): void {
    this.subscriberClient.on('message', (channel: string, message: string) => {
      try {
        const messageEvent: MessageEvent = { data: message };

        if (channel === this.NOTIFICATION_CHANNEL) {
          this.notificationSubject.next(messageEvent);
          return;
        }

        if (channel.startsWith(this.USER_CHANNEL_PREFIX)) {
          this.handleUserChannelMessage(channel, messageEvent);
        }
      } catch (error) {
        this.logger.error('Failed to process Redis notification', {
          error: error instanceof Error ? error.message : String(error),
          channel,
        });
      }
    });
  }

  private handleUserChannelMessage(
    channel: string,
    messageEvent: MessageEvent,
  ): void {
    const userId = this.extractUserIdFromChannel(channel);
    const userSubject = this.userStreams.get(userId);

    if (userSubject) {
      userSubject.next(messageEvent);
    }
  }

  private extractUserIdFromChannel(channel: string): string {
    return channel.replace(this.USER_CHANNEL_PREFIX, '');
  }

  private getUserChannel(userId: string): string {
    return `${this.USER_CHANNEL_PREFIX}${userId}`;
  }

  private parseNotificationData(data: NotificationPayload): {
    message: string;
    userIds: string[];
  } {
    const message = JSON.stringify(data);
    const userIds = data.userIds ? [...new Set(data.userIds)] : [];

    return { message, userIds };
  }

  private publishToChannels(message: string, userIds: string[]): void {
    if (userIds.length > 0) {
      for (const userId of userIds) {
        const channel = this.getUserChannel(userId);
        void this.publisherClient.publish(channel, message);
      }
    } else {
      void this.publisherClient.publish(this.NOTIFICATION_CHANNEL, message);
    }
  }

  private getOrCreateUserStream(userId: string): Observable<MessageEvent> {
    if (!this.userStreams.has(userId)) {
      this.createUserStream(userId);
    }

    const userSubject = this.userStreams.get(userId);
    if (!userSubject) {
      return this.notificationSubject.asObservable();
    }

    return userSubject.asObservable();
  }

  private createUserStream(userId: string): void {
    const userSubject = new Subject<MessageEvent>();
    this.userStreams.set(userId, userSubject);

    const userChannel = this.getUserChannel(userId);
    void this.subscribeToChannel(userChannel);

    userSubject.subscribe({
      complete: () => {
        void this.cleanupUserStream(userId, userChannel);
      },
    });
  }

  private async cleanupUserStream(
    userId: string,
    channel: string,
  ): Promise<void> {
    this.userStreams.delete(userId);
    this.subscribedChannels.delete(channel);
    await this.subscriberClient.unsubscribe(channel);
  }

  private cleanupStreams(): void {
    this.userStreams.forEach((subject) => subject.complete());
    this.userStreams.clear();
    this.subscribedChannels.clear();
  }
}
