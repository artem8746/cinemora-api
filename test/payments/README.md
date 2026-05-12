# Payments E2E tests

Jest-based end-to-end suite that exercises every code path in `src/payments/` against a real Postgres + Redis with a faked Plata-by-Mono provider.

## Run

```bash
# Stop the dev API server first — it shares the same DB and its 15-min cron
# scheduler can race with the test (scheduler-related tests will flap).
npm run test:e2e:payments              # this suite only
npm run test:e2e                       # everything under test/**/*.e2e-spec.ts

# Focus a group or a single test:
npm run test:e2e:payments -- -t "Race conditions"
npm run test:e2e:payments -- -t "scheduler: getStatus fails"
```

Pino HTTP logs are captured by Jest and only printed on failed tests.

## Layout

```
test/payments/
  mock-plata.ts            ← in-process HTTP mock of Plata's merchant API
                             owns the ECDSA P-256 keypair, signs webhooks,
                             per-invoice state machine + statusQueue.
  harness.ts               ← bootHarness/shutdownHarness, fixtures
                             (createTestUser/deleteTestUser/getUserCredits/
                             backdatePayment), webhook poster factory.
  payments.e2e-spec.ts     ← describe/it scenarios grouped by category.
```

## Isolation model

- `beforeAll` boots Nest + mock once (expensive, ~3s on first run).
- `beforeEach` creates a fresh user with a unique email and resets mock state.
- `afterEach` deletes that user + their payments + webhook audit rows.
- `afterAll` closes the app and the mock server.

Each test sees `credits=0`, no prior payments, no prior webhooks. Tests cannot leak state to each other.

`maxWorkers: 1` in [jest-e2e.json](../jest-e2e.json) — the suite shares the DB, parallelism would cause cross-talk.

## Patterns

### AAA structure

Each `it` is split into `// arrange`, `// act`, `// assert` blocks separated by blank lines. Helpers in `harness.ts` cover the boilerplate so tests stay focused on intent.

### Calling handlers

Two paths are used, picked by what's being exercised:
- **`commandBus.execute(...)`** — direct CQRS dispatch. Used for create-invoice and the stale-payments scheduler. Bypasses HTTP/JWT, keeps tests compact.
- **`postWebhook(body)`** — real HTTP `POST /api/payments/webhook/plata`. Webhook flows can't use CommandBus because the raw-body verifier needs an actual HTTP request.

### Provider state transitions across calls

The mock keeps a `statusQueue` per invoice. Each `getInvoiceStatus` shifts the head; when empty, it falls back to `status`. Use this to simulate "Plata changes state between scheduler's getStatus → cancel → refetch":

```ts
h.mock.setInvoice(invoiceId, {
  status: 'success',                       // fallback after queue drains
  statusQueue: ['created', 'success'],     // first call sees 'created', second 'success'
  cancelShouldFail: true,
});
```

### Backdating past the stale cutoff

The scheduler's threshold is 75 min. To exercise it without sleeping:

```ts
await backdatePayment(h.ds, paymentId);   // sets created_at to 2h ago
```

### Race-condition invariants

Tests under `describe('Race conditions')` don't assert per-call outcomes (which are inherently nondeterministic — both webhooks arrive on separate Fastify connections). They assert the **global invariant** instead: "credits applied exactly once", "final status is SUCCESS". A wider, more honest assertion.

## Adding a scenario

1. Pick the right `describe` group (or add a new one).
2. Inside `it(...)`, structure as `// arrange / act / assert` blocks.
3. Use the harness helpers — don't reach into `h.ds` for setup unless the helpers don't cover it.

For parametrized inputs (e.g. several mismatch fields), prefer `it.each` over copy-pasting tests. See "Invalid / forged webhooks" → mismatch test for an example.

## Known limitations

- **Cron race.** If a parallel API process is running against the same DB, its `@Cron('0 */15 * * * *')` can pick up a backdated row mid-test. Stop the dev server before running.
- **Single DB.** `maxWorkers: 1` is mandatory. Don't enable parallel execution without a per-test schema/connection split.
- **Adapter-specific.** Only the Plata adapter is exercised. A new provider needs its own mock; the port itself is provider-agnostic so the CommandBus-level scenarios carry over.
