import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  SwaggerModule.setup('API', app, document);
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  });
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);

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

  app.enableCors({
    credentials: true,
    methods: allowedMethods,
    origin: allowedOrigins,
    allowedHeaders: allowedHeaders,
  });

  await app.listen(port ?? 3000);
}

void bootstrap();
