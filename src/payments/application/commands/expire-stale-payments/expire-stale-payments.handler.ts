import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { ExpireStalePaymentsCommand } from './expire-stale-payments.command';
import {
  IPaymentProviderPort,
  PAYMENT_PROVIDER_PORT,
} from '../../../domain/payment-provider.port';
import { ProviderInvoiceState } from '../../../domain/provider-invoice-state';
import { PaymentStatus } from '../../../domain/payment.types';
import { PaymentsService } from '../../payments.service';
import { Payment } from '../../../payment.entity';
import { User } from '@/users/user.entity';

@CommandHandler(ExpireStalePaymentsCommand)
@Injectable()
export class ExpireStalePaymentsHandler implements ICommandHandler<ExpireStalePaymentsCommand> {
  private readonly logger = new Logger(ExpireStalePaymentsHandler.name);

  // Plata invoice validity is 1 hour; we add a small buffer so Plata has time
  // to flip `created` → `expired` on its side before we step in.
  // In-flight states (processing/hold) are handled by the port now, so no
  // larger buffer is needed.
  private static readonly STALE_THRESHOLD_MS = 75 * 60 * 1000;
  private static readonly RECONCILE_CONCURRENCY = 5;

  constructor(
    @Inject(PAYMENT_PROVIDER_PORT)
    private readonly paymentProvider: IPaymentProviderPort,
    private readonly paymentsService: PaymentsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async execute(): Promise<void> {
    const cutoff = new Date(
      Date.now() - ExpireStalePaymentsHandler.STALE_THRESHOLD_MS,
    );
    const stale = await this.paymentsService.findStalePendingPayments(cutoff);

    if (stale.length === 0) return;

    this.logger.log(
      `Found ${stale.length} stale pending payment(s) to reconcile`,
    );

    const batchSize = ExpireStalePaymentsHandler.RECONCILE_CONCURRENCY;
    for (let i = 0; i < stale.length; i += batchSize) {
      const batch = stale.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map((payment) => this.reconcileSafe(payment)),
      );
    }
  }

  private async reconcileSafe(payment: Payment): Promise<void> {
    try {
      await this.reconcile(payment);
    } catch (err) {
      this.logger.error(`Reconcile failed for payment ${payment.id}`, err);
    }
  }

  private async reconcile(payment: Payment): Promise<void> {
    const invoiceId = payment.providerInvoiceId as string;

    let state: ProviderInvoiceState;
    try {
      state = await this.paymentProvider.getInvoiceStatus(invoiceId);
    } catch (err) {
      this.logger.error(
        `Failed to fetch status for payment ${payment.id} (invoiceId=${invoiceId})`,
        err,
      );
      return;
    }

    if (await this.applyNonCancellable(payment.id, state)) return;

    // pending_cancellable — invoice still open at provider past validity. Try
    // to cancel; if cancel fails, re-fetch and route based on the new state
    // instead of forcing EXPIRED locally.
    try {
      await this.paymentProvider.cancelInvoice(invoiceId);
    } catch (err) {
      this.logger.error(
        `Failed to cancel invoice ${invoiceId} for payment ${payment.id}`,
        err,
      );

      let postState: ProviderInvoiceState;
      try {
        postState = await this.paymentProvider.getInvoiceStatus(invoiceId);
      } catch (refetchErr) {
        this.logger.error(
          `Failed to refetch status after cancel error for payment ${payment.id}`,
          refetchErr,
        );
        return;
      }

      if (!(await this.applyNonCancellable(payment.id, postState))) {
        this.logger.warn(
          `Payment ${payment.id} still cancellable at provider after failed cancel; will retry next tick`,
        );
      }
      return;
    }

    await this.syncTerminalStatus(payment.id, PaymentStatus.EXPIRED);
    this.logger.log(
      `Payment ${payment.id} cancelled at provider and marked EXPIRED`,
    );
  }

  // Applies any provider state except `pending_cancellable`. Returns true if
  // the state was handled (so the caller should not proceed to cancel).
  private async applyNonCancellable(
    paymentId: string,
    state: ProviderInvoiceState,
  ): Promise<boolean> {
    switch (state.kind) {
      case 'success':
        await this.applyMissedSuccess(paymentId);
        return true;
      case 'failed':
        await this.syncTerminalStatus(paymentId, PaymentStatus.FAILED);
        return true;
      case 'expired':
        await this.syncTerminalStatus(paymentId, PaymentStatus.EXPIRED);
        return true;
      case 'reversed':
        await this.syncTerminalStatus(paymentId, PaymentStatus.REVERSED);
        return true;
      case 'pending_in_flight':
        this.logger.debug(
          `Payment ${paymentId} still in flight at provider; deferring to next tick`,
        );
        return true;
      case 'pending_cancellable':
        return false;
    }
  }

  // Sync a terminal provider status into our DB. Locks the row + re-checks
  // status so a concurrent webhook can't be silently overwritten (e.g.
  // SUCCESS downgraded to FAILED/EXPIRED).
  private async syncTerminalStatus(
    paymentId: string,
    providerStatus: PaymentStatus,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const current = await this.lockPayment(manager, paymentId);
      if (!current) return;

      if (current.status !== PaymentStatus.PENDING) {
        this.logger.debug(
          `Payment ${paymentId} already ${current.status}; skipping sync to ${providerStatus}`,
        );
        return;
      }

      await manager.update(Payment, paymentId, {
        status: providerStatus,
      } as QueryDeepPartialEntity<Payment>);

      this.logger.log(
        `Payment ${paymentId} synced from provider: ${providerStatus}`,
      );
    });
  }

  // Handles the rare case where the payment succeeded but the webhook was
  // never delivered. Locks the row + re-checks status so we don't double-credit
  // if a webhook arrived between our outer read and this transaction.
  private async applyMissedSuccess(paymentId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const payment = await this.lockPayment(manager, paymentId);
      if (!payment) return;

      if (payment.status === PaymentStatus.SUCCESS) {
        this.logger.debug(
          `Payment ${paymentId} already SUCCESS; webhook arrived first`,
        );
        return;
      }

      if (payment.status !== PaymentStatus.PENDING) {
        this.logger.warn(
          `Provider reports SUCCESS but payment ${paymentId} is locally ${payment.status}; not crediting`,
        );
        return;
      }

      await manager.update(Payment, paymentId, {
        status: PaymentStatus.SUCCESS,
      } as QueryDeepPartialEntity<Payment>);

      await manager.increment(
        User,
        { id: payment.userId },
        'credits',
        payment.creditsAmount,
      );

      this.logger.warn(
        `Payment ${paymentId} was SUCCESS at provider but webhook was missed — credits applied`,
      );
    });
  }

  private lockPayment(
    manager: EntityManager,
    paymentId: string,
  ): Promise<Payment | null> {
    return manager
      .getRepository(Payment)
      .createQueryBuilder('payment')
      .setLock('pessimistic_write')
      .where('payment.id = :paymentId', { paymentId })
      .getOne();
  }
}
