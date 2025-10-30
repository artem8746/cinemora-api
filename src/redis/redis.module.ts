import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get('redis.host');
        const redisPort = configService.get('redis.port');

        return {
          type: 'single',
          url: `redis://${redisHost}:${redisPort}`,
        };
      },
    }),
  ],
  exports: [NestRedisModule],
})
export class RedisModule {}
