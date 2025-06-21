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
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get<ConfigService>(ConfigService);

  const logger = app.get(Logger);

  app.useLogger(logger);

  app.setGlobalPrefix('api');

  const isProduction = config.get<string>('nodeEnv') === 'production';
  const port = config.get<number>('PORT') ?? 3000;
  const allowedMethods =
    config.get<string>('allowedMethods') ?? 'GET,HEAD,PUT,PATCH,POST,DELETE';
  const allowedOrigins = config.get<string>('allowedOrigins') ?? '*';
  const allowedHeaders =
    config.get<string>('allowedHeaders') ??
    'Content-Type, Accept, Authorization, X-Requested-With';

  if (!isProduction) {
    enableSwagger(app);
  }

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

  await app.listen(port ?? 3000, () => {
    logger.log(`App is running on port ${process.env.PORT}`);

    if (!isProduction) {
      logger.log(
        `Swagger is available at http://localhost:${process.env.PORT}/swagger`,
      );
      logger.log(
        `Swagger JSON is available at http://localhost:${process.env.PORT}/swagger/json`,
      );
    }
  });
}

void bootstrap();
