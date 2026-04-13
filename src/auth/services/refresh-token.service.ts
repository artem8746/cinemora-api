import { Injectable } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyAccessTokenCommand } from '@/tokens/commands/verify-access-token/verify-access-token.command';
import { VerifyAccessTokenCommandResponse } from '@/tokens/commands/verify-access-token/verify-access-token.handler';
import { RefreshAccessTokenCommand } from '@/tokens/commands/refresh-access-token/refresh-access-token.command';
import { RefreshAccessTokenCommandResponse } from '@/tokens/commands/refresh-access-token/refresh-access-token.handler';
import { PinoLogger } from 'nestjs-pino';
import { CookieService } from './cookie.service';
import { ThrottlerStorage, InjectThrottlerStorage } from '@nestjs/throttler';
import type { ThrottlerStorageRecord } from '@nestjs/throttler/dist/throttler-storage-record.interface';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RefreshTokenService {
  private readonly LOCK_TTL = 5 * 1000; // 5 sec
  private readonly RATE_LIMIT_TTL = 60 * 1000; // 60 sec
  private readonly RATE_LIMIT_MAX_ATTEMPTS = 5;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly logger: PinoLogger,
    private readonly cookieService: CookieService,
    @InjectThrottlerStorage()
    private readonly throttlerStorage: ThrottlerStorage,
    @InjectRedis() private readonly redisClient: Redis,
  ) {
    this.logger.setContext(RefreshTokenService.name);
  }

  private getLockKey(refreshToken: string): string {
    return `refresh_token:lock:${refreshToken}`;
  }

  private getRateLimitKey(refreshToken: string): string {
    return `refresh_token:rate_limit:${refreshToken}`;
  }

  private async checkRateLimit(refreshToken: string): Promise<boolean> {
    const key = this.getRateLimitKey(refreshToken);

    const record: ThrottlerStorageRecord =
      await this.throttlerStorage.increment(
        key,
        this.RATE_LIMIT_TTL,
        this.RATE_LIMIT_MAX_ATTEMPTS,
        this.LOCK_TTL,
        'refresh-token',
      );

    if (record.isBlocked || record.totalHits > this.RATE_LIMIT_MAX_ATTEMPTS) {
      this.logger.warn('Rate limit exceeded for refresh token', {
        refreshToken: refreshToken.substring(0, 10) + '...',
        attempts: record.totalHits,
        isBlocked: record.isBlocked,
      });
      return false;
    }

    return true;
  }

  private async acquireLock(refreshToken: string): Promise<boolean> {
    const key = this.getLockKey(refreshToken);
    const result = await this.redisClient.set(
      key,
      '1',
      'EX',
      this.LOCK_TTL,
      'NX',
    );
    return result === 'OK';
  }

  private async releaseLock(refreshToken: string): Promise<void> {
    const key = this.getLockKey(refreshToken);
    await this.redisClient.del(key);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Waits while another in-flight request holds the refresh lock (parallel tabs / burst). */
  private async acquireLockWithRetry(refreshToken: string): Promise<boolean> {
    const maxAttempts = 40;
    const delayMs = 50;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const acquired = await this.acquireLock(refreshToken);
      if (acquired) {
        return true;
      }
      await this.sleep(delayMs);
    }

    return false;
  }

  async handleRefreshToken(
    req: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const cookies = req.cookies || {};
    const accessToken = cookies.accessToken;
    const refreshToken = cookies.refreshToken;

    if (!accessToken) {
      return;
    }

    const verificationResult = await this.commandBus.execute<
      VerifyAccessTokenCommand,
      VerifyAccessTokenCommandResponse
    >(new VerifyAccessTokenCommand(accessToken));

    if (verificationResult.isValid) {
      return;
    }

    if (!verificationResult.isExpired || !refreshToken) {
      return;
    }

    const isWithinRateLimit = await this.checkRateLimit(refreshToken);
    if (!isWithinRateLimit) {
      this.logger.warn('Refresh token rate limit exceeded', {
        refreshToken: refreshToken.substring(0, 10) + '...',
      });
      return;
    }

    const lockAcquired = await this.acquireLockWithRetry(refreshToken);
    if (!lockAcquired) {
      this.logger.warn(
        'Refresh token lock not acquired after retries; skipping refresh',
      );
      return;
    }

    try {
      const result = await this.commandBus.execute<
        RefreshAccessTokenCommand,
        RefreshAccessTokenCommandResponse
      >(new RefreshAccessTokenCommand(refreshToken));

      if (!result?.accessToken) {
        this.logger.warn('Failed to refresh token: invalid result', {
          hasAccessToken: !!result?.accessToken,
        });
        return;
      }

      const { accessToken: newAccessToken } = result;

      this.cookieService.setAuthCookies(reply, newAccessToken, refreshToken);

      if (!req.cookies) {
        req.cookies = {};
      }
      req.cookies.accessToken = newAccessToken;

      const existingCookies = req.headers.cookie
        ? req.headers.cookie.split(';').filter((cookie) => {
            const cookieName = cookie.trim().split('=')[0];
            return cookieName !== 'accessToken';
          })
        : [];
      req.headers.cookie = [
        ...existingCookies.map((c) => c.trim()),
        `accessToken=${encodeURIComponent(newAccessToken)}`,
      ].join('; ');

      this.logger.debug('Token refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    } finally {
      await this.releaseLock(refreshToken);
    }
  }
}
