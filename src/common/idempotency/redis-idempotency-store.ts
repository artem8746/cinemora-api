import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import {
  IIdempotencyStore,
  IdempotencyOptions,
} from './idempotency-store.port';

@Injectable()
export class RedisIdempotencyStore implements IIdempotencyStore {
  private static readonly DEFAULT_RESULT_TTL_SEC = 24 * 60 * 60;
  private static readonly DEFAULT_LOCK_TTL_SEC = 60;

  private readonly logger = new Logger(RedisIdempotencyStore.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async execute<T>(
    options: IdempotencyOptions,
    operation: () => Promise<T>,
  ): Promise<T> {
    const resultTtlSec =
      options.resultTtlSec ?? RedisIdempotencyStore.DEFAULT_RESULT_TTL_SEC;
    const lockTtlSec =
      options.lockTtlSec ?? RedisIdempotencyStore.DEFAULT_LOCK_TTL_SEC;
    const resultKey = this.buildKey('result', options.namespace, options.key);
    const lockKey = this.buildKey('lock', options.namespace, options.key);

    const cached = await this.readCached<T>(resultKey);
    if (cached !== null) return cached;

    await this.acquireLockOrThrow(lockKey, lockTtlSec);

    try {
      // Re-check after lock — another caller may have finished between our
      // first read and lock acquisition.
      const cachedAfterLock = await this.readCached<T>(resultKey);
      if (cachedAfterLock !== null) return cachedAfterLock;

      const result = await operation();
      await this.writeCached(resultKey, result, resultTtlSec);
      return result;
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  private buildKey(kind: 'result' | 'lock', namespace: string, key: string) {
    return `idempotency:${kind}:${namespace}:${key}`;
  }

  private async readCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch (err) {
      this.logger.error(
        `Failed to read idempotency cache: key=${key}`,
        err instanceof Error ? err.stack : String(err),
      );
      // Fail-closed: if we cannot verify a result is absent, refuse to run a
      // second operation that might duplicate side effects.
      throw new ServiceUnavailableException(
        'Idempotency store unavailable, please retry',
      );
    }
  }

  private async writeCached<T>(
    key: string,
    value: T,
    ttlSec: number,
  ): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSec);
    } catch (err) {
      // Best-effort: the operation already succeeded; failing to cache only
      // costs idempotency on this exact key, not correctness for the caller.
      this.logger.error(
        `Failed to cache idempotent response: key=${key}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  private async acquireLockOrThrow(key: string, ttlSec: number): Promise<void> {
    let result: 'OK' | null;
    try {
      result = await this.redis.set(key, '1', 'EX', ttlSec, 'NX');
    } catch (err) {
      this.logger.error(
        `Failed to acquire idempotency lock: key=${key}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new ServiceUnavailableException(
        'Idempotency store unavailable, please retry',
      );
    }
    if (result !== 'OK') {
      throw new ConflictException(
        'Another operation is already in progress for this idempotency key',
      );
    }
  }

  private async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.error(
        `Failed to release idempotency lock: key=${key}`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
