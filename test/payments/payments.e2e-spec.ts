import * as crypto from 'crypto';
import { CreateInvoiceCommand } from '@/payments/application/commands/create-invoice/create-invoice.command';
import { ExpireStalePaymentsCommand } from '@/payments/application/commands/expire-stale-payments/expire-stale-payments.command';
import { Payment } from '@/payments/payment.entity';
import {
  PaymentWebhook,
  PaymentWebhookOutcome,
} from '@/payments/payment-webhook.entity';
import { PaymentStatus } from '@/payments/domain/payment.types';
import {
  TestHarness,
  TestUser,
  WebhookPoster,
  backdatePayment,
  bootHarness,
  createTestUser,
  defined,
  deleteTestUser,
  getUserCredits,
  makeWebhookPoster,
  nowIso,
  shutdownHarness,
} from './harness';

describe('Payments E2E', () => {
  let h: TestHarness;
  let postWebhook: WebhookPoster;
  let user: TestUser;

  // Boot Nest + mock once for the whole suite — these are expensive.
  beforeAll(async () => {
    h = await bootHarness();
    postWebhook = makeWebhookPoster(h);
  });

  afterAll(async () => {
    await shutdownHarness(h);
  });

  // Fresh user per test → fresh credits, no payment carryover, no shared state.
  beforeEach(async () => {
    h.mock.reset();
    user = await createTestUser(h.ds);
  });

  afterEach(async () => {
    await deleteTestUser(h.ds, user.id);
  });

  // ---- helpers bound to the current test user -----------------------------
  // Explicit return type — CommandBus.execute's overloads default `R = any`,
  // and without this the inferred return leaks `any` into Promise.allSettled
  // callers, causing `no-unsafe-member-access` on the result.
  type InvoiceResult = { paymentId: string; pageUrl: string };

  const createPlanInvoice = (
    planId: string,
    idempotencyKey?: string,
  ): Promise<InvoiceResult> =>
    h.commandBus.execute<CreateInvoiceCommand, InvoiceResult>(
      new CreateInvoiceCommand(
        user.id,
        idempotencyKey ?? `e2e-${crypto.randomUUID()}`,
        planId,
        undefined,
      ),
    );

  const createCustomInvoice = (
    tokenAmount: number,
    idempotencyKey?: string,
  ): Promise<InvoiceResult> =>
    h.commandBus.execute<CreateInvoiceCommand, InvoiceResult>(
      new CreateInvoiceCommand(
        user.id,
        idempotencyKey ?? `e2e-${crypto.randomUUID()}`,
        undefined,
        tokenAmount,
      ),
    );

  const findPayment = (id: string) =>
    h.ds.getRepository(Payment).findOneOrFail({ where: { id } });

  const findLatestWebhook = (invoiceId?: string) =>
    h.ds
      .getRepository(PaymentWebhook)
      .find({
        where: invoiceId ? { providerInvoiceId: invoiceId } : {},
        order: { receivedAt: 'DESC' },
        take: 1,
      })
      .then((rows) => rows[0] ?? null);

  // ==========================================================================
  describe('Happy paths', () => {
    it('plan invoice + SUCCESS webhook → credits applied', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const payment = await findPayment(paymentId);

      // act
      const res = await postWebhook({
        invoiceId: payment.providerInvoiceId,
        status: 'success',
        amount: payment.amount,
        ccy: payment.ccy,
        finalAmount: payment.amount,
        reference: paymentId,
        modifiedDate: nowIso(),
      });

      // assert
      expect(res.status).toBe(200);
      const after = await findPayment(paymentId);
      expect(after.status).toBe(PaymentStatus.SUCCESS);
      expect(await getUserCredits(h.ds, user.id)).toBe(payment.creditsAmount);
    });

    it('custom tokenAmount → correct price (tokenAmount × settings.tokenPricePerUnit)', async () => {
      // act
      const { paymentId } = await createCustomInvoice(7);

      // assert
      const p = await findPayment(paymentId);
      expect(p.planId).toBe('custom');
      expect(p.creditsAmount).toBe(7);
      expect(p.amount).toBe(7 * 490); // tokenPricePerUnit=490 from seed
    });
  });

  // ==========================================================================
  describe('Cancel / Expire via timeout (scheduler)', () => {
    it('stale + provider="created" → cancelInvoice → EXPIRED', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      await backdatePayment(h.ds, paymentId);
      // mock default status for new invoices is 'created'

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      const after = await findPayment(paymentId);
      expect(after.status).toBe(PaymentStatus.EXPIRED);
      expect(await getUserCredits(h.ds, user.id)).toBe(0);
    });

    it('stale + provider="expired" → synced to EXPIRED', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'expired',
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.EXPIRED);
      expect(await getUserCredits(h.ds, user.id)).toBe(0);
    });

    it('stale + provider="success" (missed webhook) → SUCCESS + credits', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('pro');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'success',
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.SUCCESS);
      expect(await getUserCredits(h.ds, user.id)).toBe(p.creditsAmount);
    });

    it('stale + provider="processing" → stays PENDING (in-flight defer)', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'processing',
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.PENDING);
    });

    it('stale + "created", cancel fails, refetch="success" → SUCCESS + credits', async () => {
      // arrange — queue lets getInvoiceStatus return different values on
      // successive calls: first 'created' (cancellable), then 'success'.
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'success',
        statusQueue: ['created', 'success'],
        cancelShouldFail: true,
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.SUCCESS);
      expect(await getUserCredits(h.ds, user.id)).toBe(p.creditsAmount);
    });
  });

  // ==========================================================================
  describe('Idempotency / duplicates', () => {
    it('same Idempotency-Key twice → same paymentId, one row', async () => {
      // arrange
      const key = `idem-${crypto.randomUUID()}`;

      // act
      const a = await createPlanInvoice('starter', key);
      const b = await createPlanInvoice('starter', key);

      // assert
      expect(a.paymentId).toBe(b.paymentId);
      const all = await h.ds
        .getRepository(Payment)
        .find({ where: { userId: user.id } });
      expect(all).toHaveLength(1);
    });

    it('concurrent same-key requests → at most one new row, no distinct ids', async () => {
      // arrange
      const key = `idem-${crypto.randomUUID()}`;

      // act — Redis lock means either both fulfill with same id, or one 409s.
      const settled = await Promise.allSettled([
        createPlanInvoice('starter', key),
        createPlanInvoice('starter', key),
      ]);

      // assert
      const ids = settled.flatMap((r) =>
        r.status === 'fulfilled' ? [r.value.paymentId] : [],
      );
      expect(ids.length).toBeGreaterThanOrEqual(1);
      expect(new Set(ids).size).toBe(1); // never two distinct paymentIds
      const all = await h.ds
        .getRepository(Payment)
        .find({ where: { userId: user.id } });
      expect(all).toHaveLength(1);
    });

    it('duplicate SUCCESS webhook → credits added once', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('pro');
      const p = await findPayment(paymentId);
      const body = {
        invoiceId: p.providerInvoiceId,
        status: 'success',
        amount: p.amount,
        ccy: p.ccy,
        finalAmount: p.amount,
        reference: paymentId,
        modifiedDate: nowIso(),
      };

      // act
      const r1 = await postWebhook(body);
      const r2 = await postWebhook(body);

      // assert
      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);
      expect(await getUserCredits(h.ds, user.id)).toBe(p.creditsAmount);
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.SUCCESS);
    });

    it('SUCCESS webhook after FAILED → IGNORED_DUPLICATE (terminal guard)', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      const baseBody = {
        invoiceId: p.providerInvoiceId,
        amount: p.amount,
        ccy: p.ccy,
        finalAmount: p.amount,
        reference: paymentId,
        modifiedDate: nowIso(),
      };

      // act
      await postWebhook({ ...baseBody, status: 'failure' });
      await postWebhook({ ...baseBody, status: 'success' });

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.FAILED);
      expect(await getUserCredits(h.ds, user.id)).toBe(0);
    });
  });

  // ==========================================================================
  describe('Invalid / forged webhooks', () => {
    it('bad signature → REJECTED_SIGNATURE, payment unchanged', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      const body = {
        invoiceId: p.providerInvoiceId,
        status: 'success',
        amount: p.amount,
        ccy: p.ccy,
        finalAmount: p.amount,
        reference: paymentId,
        modifiedDate: nowIso(),
      };

      // act
      const res = await postWebhook(body, {
        signatureOverride: Buffer.alloc(70, 0x42).toString('base64'),
      });

      // assert
      expect(res.status).toBeGreaterThanOrEqual(400);
      const hook = await findLatestWebhook();
      expect(hook?.outcome).toBe(PaymentWebhookOutcome.REJECTED_SIGNATURE);
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.PENDING);
      expect(await getUserCredits(h.ds, user.id)).toBe(0);
    });

    it('unknown invoiceId → IGNORED_UNKNOWN_INVOICE, controller still 200', async () => {
      // act
      const res = await postWebhook({
        invoiceId: 'mock-inv-NON-EXISTENT',
        status: 'success',
        amount: 4900,
        ccy: 980,
        finalAmount: 4900,
        reference: '00000000-0000-0000-0000-000000000000',
        modifiedDate: nowIso(),
      });

      // assert — 200 because retrying the webhook would never help; ack it.
      expect(res.status).toBe(200);
      const hook = await findLatestWebhook('mock-inv-NON-EXISTENT');
      expect(hook?.outcome).toBe(PaymentWebhookOutcome.IGNORED_UNKNOWN_INVOICE);
    });

    it.each([
      [
        'amount',
        (p: Payment, paymentId: string) => ({
          invoiceId: p.providerInvoiceId,
          status: 'success',
          amount: p.amount + 1,
          ccy: p.ccy,
          finalAmount: p.amount + 1,
          reference: paymentId,
          modifiedDate: nowIso(),
        }),
      ],
      [
        'ccy',
        (p: Payment, paymentId: string) => ({
          invoiceId: p.providerInvoiceId,
          status: 'success',
          amount: p.amount,
          ccy: 840, // USD instead of UAH
          finalAmount: p.amount,
          reference: paymentId,
          modifiedDate: nowIso(),
        }),
      ],
      [
        'reference',
        (p: Payment) => ({
          invoiceId: p.providerInvoiceId,
          status: 'success',
          amount: p.amount,
          ccy: p.ccy,
          finalAmount: p.amount,
          reference: '11111111-1111-1111-1111-111111111111',
          modifiedDate: nowIso(),
        }),
      ],
      [
        'future timestamp',
        (p: Payment, paymentId: string) => ({
          invoiceId: p.providerInvoiceId,
          status: 'success',
          amount: p.amount,
          ccy: p.ccy,
          finalAmount: p.amount,
          reference: paymentId,
          modifiedDate: nowIso(10 * 60 * 1000),
        }),
      ],
    ])('%s mismatch → REJECTED_VALIDATION', async (_, buildBody) => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);

      // act
      const res = await postWebhook(buildBody(p, paymentId));

      // assert
      expect(res.status).toBeGreaterThanOrEqual(400);
      const hook = await findLatestWebhook(
        defined(p.providerInvoiceId, 'providerInvoiceId'),
      );
      expect(hook?.outcome).toBe(PaymentWebhookOutcome.REJECTED_VALIDATION);
    });

    it('missing field (amount) → REJECTED_VALIDATION', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);

      // act — parseWebhookBody throws before attachInvoiceId runs, so the
      // audit row never gets providerInvoiceId. Look up by latest received_at.
      const res = await postWebhook({
        invoiceId: p.providerInvoiceId,
        status: 'success',
        ccy: p.ccy,
        reference: paymentId,
        modifiedDate: nowIso(),
      });

      // assert
      expect(res.status).toBeGreaterThanOrEqual(400);
      const hook = await findLatestWebhook();
      expect(hook?.outcome).toBe(PaymentWebhookOutcome.REJECTED_VALIDATION);
    });
  });

  // ==========================================================================
  describe('Race conditions', () => {
    it('two concurrent SUCCESS webhooks → credits applied exactly once', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('pro');
      const p = await findPayment(paymentId);
      const body = {
        invoiceId: p.providerInvoiceId,
        status: 'success',
        amount: p.amount,
        ccy: p.ccy,
        finalAmount: p.amount,
        reference: paymentId,
        modifiedDate: nowIso(),
      };

      // act
      await Promise.all([postWebhook(body), postWebhook(body)]);

      // assert — the invariant that matters is "credits added once", not the
      // specific outcome per webhook (which is inherent-race nondeterministic
      // when both arrive simultaneously on different connections).
      expect(await getUserCredits(h.ds, user.id)).toBe(p.creditsAmount);
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.SUCCESS);
    });

    it('webhook SUCCESS + scheduler concurrently → no double credit', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('pro');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'success',
      });
      await backdatePayment(h.ds, paymentId);

      // act — both pessimistic-write-lock the same row; whichever wins, the
      // other reads SUCCESS and skips crediting.
      await Promise.all([
        postWebhook({
          invoiceId: p.providerInvoiceId,
          status: 'success',
          amount: p.amount,
          ccy: p.ccy,
          finalAmount: p.amount,
          reference: paymentId,
          modifiedDate: nowIso(),
        }),
        h.commandBus.execute(new ExpireStalePaymentsCommand()),
      ]);

      // assert
      expect(await getUserCredits(h.ds, user.id)).toBe(p.creditsAmount);
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.SUCCESS);
    });
  });

  // ==========================================================================
  describe('Provider unavailable', () => {
    it('createInvoice 500 → payment row FAILED + BadGateway thrown', async () => {
      // arrange
      h.mock.setCreateShouldFail(true);

      // act + assert (throw)
      await expect(createPlanInvoice('starter')).rejects.toThrow(
        /provider|gateway|unavailable/i,
      );

      // assert (db state)
      const payments = await h.ds
        .getRepository(Payment)
        .find({ where: { userId: user.id } });
      expect(payments).toHaveLength(1);
      expect(payments[0]?.status).toBe(PaymentStatus.FAILED);
    });

    it('scheduler: getStatus fails → payment stays PENDING', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        statusShouldFail: true,
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.PENDING);
    });

    it('scheduler: cancel fails, refetch still cancellable → stays PENDING', async () => {
      // arrange
      const { paymentId } = await createPlanInvoice('starter');
      const p = await findPayment(paymentId);
      h.mock.setInvoice(defined(p.providerInvoiceId, 'providerInvoiceId'), {
        status: 'created',
        cancelShouldFail: true,
      });
      await backdatePayment(h.ds, paymentId);

      // act
      await h.commandBus.execute(new ExpireStalePaymentsCommand());

      // assert — handler logs a warning and defers to the next tick.
      expect((await findPayment(paymentId)).status).toBe(PaymentStatus.PENDING);
    });
  });
});
