import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  app.setGlobalPrefix('api');

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    enableSwagger(app);
  }

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
