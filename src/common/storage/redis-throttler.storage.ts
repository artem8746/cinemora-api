import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const recordKey = `throttler:${throttlerName}:${key}`;
    const blockKey = `throttler:${throttlerName}:block:${key}`;

    const isBlocked = await this.redisClient.exists(blockKey);
    if (isBlocked) {
      const blockTtl = await this.redisClient.ttl(blockKey);
      return {
        totalHits: limit,
        timeToExpire: Date.now() + blockTtl * 1000,
        isBlocked: true,
        timeToBlockExpire: Date.now() + blockTtl * 1000,
      };
    }

    const value = await this.redisClient.get(recordKey);
    let record: ThrottlerStorageRecord;

    if (!value) {
      record = {
        totalHits: 1,
        timeToExpire: Date.now() + ttl,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
      await this.redisClient.setex(
        recordKey,
        Math.ceil(ttl / 1000),
        JSON.stringify(record),
      );
    } else {
      const parsed = JSON.parse(value) as ThrottlerStorageRecord;
      const newTotalHits = parsed.totalHits + 1;

      if (newTotalHits > limit) {
        await this.redisClient.setex(
          blockKey,
          Math.ceil(blockDuration / 1000),
          '1',
        );

        record = {
          totalHits: newTotalHits,
          timeToExpire: parsed.timeToExpire,
          isBlocked: true,
          timeToBlockExpire: Date.now() + blockDuration,
        };
      } else {
        const currentTtl = await this.redisClient.ttl(recordKey);
        record = {
          totalHits: newTotalHits,
          timeToExpire:
            currentTtl > 0 ? Date.now() + currentTtl * 1000 : Date.now() + ttl,
          isBlocked: false,
          timeToBlockExpire: 0,
        };

        if (currentTtl > 0) {
          await this.redisClient.setex(
            recordKey,
            currentTtl,
            JSON.stringify(record),
          );
        } else {
          await this.redisClient.setex(
            recordKey,
            Math.ceil(ttl / 1000),
            JSON.stringify(record),
          );
        }
      }
    }

    return record;
  }
}
