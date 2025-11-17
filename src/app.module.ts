import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { Response } from 'express';
import { SentryModule } from '@sentry/nestjs/setup';
import { EmailModule } from './email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostgresDataSource } from './database/data-source';
import { AuthModule } from './auth/auth.module';
import { getConfiguration } from './config';
import { TokensModule } from './tokens/tokens.module';
import { OpenAIModule } from './openai/openai.module';
import { CqrsModule } from '@nestjs/cqrs';
import { RedisModule } from './redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { RedisThrottlerStorage } from './common/storage/redis-throttler.storage';
import Redis from 'ioredis';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      load: [getConfiguration],
      cache: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...PostgresDataSource.options,
        autoLoadEntities: true,
        retryAttempts: 2,
        retryDelay: 1000,
      }),
    }),
    CqrsModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (redisClient: Redis) => ({
        throttlers: [
          {
            ttl: 60000,
            limit: 5,
          },
        ],
        storage: new RedisThrottlerStorage(redisClient),
      }),
      inject: ['default_IORedisModuleConnectionToken'],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: {
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                colorize: true,
              },
            },
            {
              target: 'pino/file',
              level: 'debug',
              options: { destination: './logs/app.log', mkdir: true },
            },
            {
              target: 'pino/file',
              level: 'error',
              options: { destination: './logs/error.log', mkdir: true },
            },
          ],
        },
        serializers: {
          req(req: Request) {
            return {
              method: req.method,
              url: req.url,
              headers: req.headers,
              body: req.body,
            };
          },
          res(res: Response) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    }),
    EmailModule,
    UsersModule,
    AuthModule,
    TokensModule,
    RedisModule,
    OpenAIModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
