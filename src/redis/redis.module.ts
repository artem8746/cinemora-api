import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      useFactory: () => {
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = process.env.REDIS_PORT || '6379';

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
