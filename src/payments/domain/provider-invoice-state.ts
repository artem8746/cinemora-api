import { PaymentStatus } from './payment.types';

// Reconciliation view of an invoice. Richer than PaymentStatus because the
// scheduler needs to distinguish "open at provider, safe to cancel" from
// "still in flight at provider, must not touch". Each adapter decides which
// of its raw provider states fall into which bucket.
export type ProviderInvoiceState =
  | { kind: 'success' }
  | { kind: 'failed' }
  | { kind: 'expired' }
  | { kind: 'reversed' }
  | { kind: 'pending_cancellable' }
  | { kind: 'pending_in_flight' };

export function providerStateToPaymentStatus(
  state: ProviderInvoiceState,
): PaymentStatus {
  switch (state.kind) {
    case 'success':
      return PaymentStatus.SUCCESS;
    case 'failed':
      return PaymentStatus.FAILED;
    case 'expired':
      return PaymentStatus.EXPIRED;
    case 'reversed':
      return PaymentStatus.REVERSED;
    case 'pending_cancellable':
    case 'pending_in_flight':
      return PaymentStatus.PENDING;
  }
}
