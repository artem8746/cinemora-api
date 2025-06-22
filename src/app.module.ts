import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env-validation.schema';
import { LoggerModule } from 'nestjs-pino';
import { Response } from 'express';
import { SentryModule } from '@sentry/nestjs/setup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostgresDataSource } from './database/data-source';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_PATH,
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...PostgresDataSource.options,
        autoLoadEntities: true,
      }),
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
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
