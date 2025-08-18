import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Configuration } from './config';
import fastifyCookie from '@fastify/cookie';
import '@fastify/cookie';

function enableSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Cinemora API')
    .setDescription('Cinemora API')
    .addCookieAuth('connect.sid', {
      type: 'apiKey',
      in: 'cookie',
      name: 'connect.sid',
    })
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  const configService =
    app.get<ConfigService<Configuration, true>>(ConfigService);
  const port = configService.get('app.port') ?? 3100;
  const cookiesSecret = configService.get('app.cookiesSecret');

  const logger = app.get(Logger);

  app.useLogger(logger);

  app.setGlobalPrefix('api');

  const isProduction = configService.get('app.isProduction');
  const allowedMethods =
    configService.get('cors.allowedMethods') ??
    'GET,HEAD,PUT,PATCH,POST,DELETE';
  const allowedOrigins = configService.get('cors.allowedOrigins') ?? '*';
  const allowedHeaders =
    configService.get('cors.allowedHeaders') ??
    'Content-Type, Accept, Authorization, X-Requested-With';

  if (!isProduction) {
    enableSwagger(app);
  }

  await app.register(fastifyCookie, {
    secret: cookiesSecret,
  });

  // Validation pipe to handle dto validation errors globally and return a custom error response
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = {};
        validationErrors.forEach((error) => {
          errors[error.property] = error.constraints
            ? Object.values(error.constraints)
            : [];
        });

        return new BadRequestException({
          error: {
            message: 'Validation Error',
            details: errors,
          },
          status: 400,
        });
      },
    }),
  );

  app.enableCors({
    credentials: true,
    methods: allowedMethods,
    origin: allowedOrigins,
    allowedHeaders: allowedHeaders,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen({ port, host: '0.0.0.0' });
  logger.log(`🚀 App is running on port ${port}`);

  if (!isProduction) {
    logger.log(`Swagger is available at http://localhost:${port}/swagger`);
    logger.log(
      `Swagger JSON is available at http://localhost:${port}/swagger/json`,
    );
  }
}

void bootstrap();
