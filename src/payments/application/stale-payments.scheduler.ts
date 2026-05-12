import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { ExpireStalePaymentsCommand } from './commands/expire-stale-payments/expire-stale-payments.command';

@Injectable()
export class StalePaymentsScheduler {
  private readonly logger = new Logger(StalePaymentsScheduler.name);

  constructor(private readonly commandBus: CommandBus) {}

  @Cron('0 */15 * * * *')
  async run(): Promise<void> {
    this.logger.debug('Running stale payments reconciliation');
    try {
      await this.commandBus.execute(new ExpireStalePaymentsCommand());
    } catch (err) {
      this.logger.error('Stale payments reconciliation failed', err);
    }
  }
}
