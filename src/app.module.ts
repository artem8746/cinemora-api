import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env-validation.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.ENV_PATH,
      validationSchema: envValidationSchema,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
