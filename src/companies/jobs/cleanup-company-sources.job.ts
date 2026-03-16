import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import Redis from 'ioredis';
import { CompaniesService } from '@/companies/companies.service';

const CLEANUP_LOCK_KEY = 'companies:cleanup-old-sources:lock';
const CLEANUP_LOCK_TTL_SECONDS = 5 * 60;

@Injectable()
export class CleanupCompanySourcesJob {
  private readonly logger = new Logger(CleanupCompanySourcesJob.name);

  constructor(
    private readonly companiesService: CompaniesService,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async handle(): Promise<void> {
    const lock = await this.redisClient.set(
      CLEANUP_LOCK_KEY,
      '1',
      'EX',
      CLEANUP_LOCK_TTL_SECONDS,
      'NX',
    );

    if (lock !== 'OK') {
      return;
    }

    try {
      await this.companiesService.cleanupOldSources();
      this.logger.log('cleanup_completed');
    } catch (error) {
      this.logger.error(
        `cleanup_failed error=${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await this.redisClient.del(CLEANUP_LOCK_KEY);
    }
  }
}
