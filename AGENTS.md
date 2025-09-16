# AGENTS.md — Rules the AI Must Follow

> **Context**: NestJS backend service for a video streaming platform. Stack: **NestJS**, **TypeORM (PostgreSQL)**, **Event‑Driven Architecture** via **NATS (JetStream)** or equivalent. Node 20+, TypeScript strict mode.

---

## 0) Guiding Principles (READ FIRST)

- **Safety first**: Prefer small, reversible changes with tests and migrations. Never break prod by schema sync.
- **EDA everywhere**: Side‑effects propagate through **events**, not controller callbacks. Use **Outbox** for DB→event consistency. Consumers are **idempotent**.
- **Types only**: Code must be 100% **type‑safe**; no `any`. Use `unknown` + narrowing if needed. DTOs are validated & transformed.
- **Separation of concerns**: **Controller → Service (application) → Domain → Infrastructure**. No ORM calls in controllers. No I/O in domain.
- **Observability**: Structured logs, request IDs, metrics. No silent failures.
- **Backward compatibility**: Version APIs and events. Never make breaking changes without a deprecation path.

---

## 1) Project Boundaries & Layering

**Layers**

1. **API (Controllers)**: Authn/z, request validation, mapping to application services. No business rules, no ORM.
2. **Application Services**: Orchestrate use‑cases, transactions, publish domain events via `EventBus` (NATS).
3. **Domain**: Entities, value objects, domain services, domain events (in‑memory only). Pure TS, side‑effect free.
4. **Infrastructure**: TypeORM repositories, NATS adapters, storage (local/S3), email, caching, logging.

**Rules**

- Controllers call **Application Services** only. Application Services depend on **Domain** and **Ports** (interfaces).
- Infrastructure implements ports and is injected via Nest providers.
- **No cross‑layer shortcuts** (e.g., controller → repository). Enforce via folder structure & tsconfig path aliases.

---

## 2) Event‑Driven Architecture (EDA)

- **Bus**: NATS with JetStream (or compatible interface). Topics use **kebab.case** with version suffix: `media.upload.completed.v1`.
- **Payloads**: JSON, explicitly typed. Define schemas/types in `packages/events` and reuse across services.
- **Outbox Pattern**: Persist domain change **and** an `outbox_events` record in the same transaction. A publisher worker relays to NATS.
- **Idempotency**: Include `eventId` and `aggregateId`. Consumers must be safe to **replay**. Use durable subscriptions.
- **Ordering**: Do not assume global ordering. When required, key by `aggregateId` and manage sequence numbers.
- **Versioning**: Never mutate old payload shapes. Introduce `*.v2` topics; keep consumers for `v1` until fully retired.
- **Error handling**: Nack with retry policy + DLQ (dead‑letter subject). Emit `*.failed.v1` events with reason.

**Core Topics** (initial)

- `media.upload.completed.v1`
- `media.transcode.requested.v1`
- `media.transcode.completed.v1`
- `media.asset.published.v1`
- `playback.session.started.v1`
- `playback.session.heartbeat.v1`
- `playback.session.ended.v1`

---

## 3) Type Safety & Validation

- `tsconfig.json`: `"strict": true, "noImplicitAny": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true`.
- **Never** use `any`. Prefer `unknown` + type guards. Use branded types for IDs (e.g., `VideoId`).
- DTOs use `class-validator` & `class-transformer`. Validate at controller boundary only.
- Map DTO ⇄ Domain using explicit mappers. Do not leak ORM entities to HTTP.
- API responses typed via DTOs; do not return raw entities.

---

## 4) TypeORM Rules

- **Data Mapper** style (custom repositories / `Repository<T>`). **No Active Record**.
- **Migrations only**: `synchronize: false` always. Every schema change includes **up & down** migrations and is **backward compatible**.
- **Transactions**: Application service opens transactional boundary when modifying multiple aggregates; write outbox within the same tx.
- **Indexes**: Add appropriate indexes for lookups (e.g., `(video_id, created_at)` on variants). Never create unused indexes.
- **Soft deletes** where appropriate. Never hard‑delete user‑generated content without explicit requirement.

---

## 5) API Design Rules

- Base path `/v1`. Use RESTful nouns: `/videos`, `/uploads`, `/playback-sessions`.
- **Auth**: JWT Bearer. Roles: `admin`, `uploader`, `viewer`. Use guards & declarative policies.
- **Idempotent** endpoints for mutating operations exposed to clients (e.g., upload complete) via `Idempotency-Key` header.
- **Pagination**: Cursor‑based. Always return `nextCursor`.
- Errors: Problem Details style (`type`, `title`, `status`, `detail`, `instance`). Do not leak stack traces.

---

## 6) Logging, Metrics, Tracing

- Use structured logger (pino‑compatible). Include `requestId`, `userId`, `route`, `durationMs`.
- Log levels: `info` for business events, `warn` for recoverable issues, `error` with stack for failures. No `console.log`.
- Emit metrics (Prometheus/OpenTelemetry): request duration, DB timings, NATS publish/consume, retries, DLQ counts.
- Propagate trace IDs across HTTP and events.

---

## 7) Testing Policy

- **Unit**: Domain and mappers at 100% critical path coverage.
- **Integration**: Repositories with a real Postgres (Testcontainers). Verify migrations apply cleanly.
- **E2E**: Supertest over Nest app; include auth, RBAC, happy + failure paths.
- Event consumers tested with an embedded NATS or mock bus to ensure idempotency & retry logic.
- **No flaky tests**. Add deterministic seeds & fixed clocks where needed.

**Quality Gates (CI)**

- `npm run lint` passes; `npm run format:check` passes.
- Coverage threshold: **80%+** lines/branches (raise over time).
- Migrations generate no drift (`typeorm migration:show` clean).

---

## 8) Lint, Style, and Commit Rules

- ESLint + Prettier. Enforce: `@typescript-eslint/no-floating-promises`, `no-void`, `prefer-readonly`, `no-restricted-syntax` for `for..in` over arrays, etc.
- Import order: node → third‑party → internal (aliased) → relative.
- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`. Scope by area, e.g., `feat(video): add publish endpoint`.
- PRs ≤ \~400 LOC changed (excluding snapshots/migrations). Larger work must be split.

---

## 9) Configuration, Secrets, and Env

- Use `@nestjs/config`; validate env with a schema (e.g., `zod` or `joi`).
- No secrets in code or `docker-compose.yml`. Use `.env` for local only; CI injects via secrets.
- Feature flags via env or a central config service. Default to safe behavior.

---

## 10) Reliability & Data Safety

- For long‑running jobs (transcode), **enqueue** and emit progress via events. No blocking HTTP.
- All storage writes are **atomic** or retried. Validate checksums after upload.
- Introduce **circuit breakers** for external dependencies (storage, email, CDN) and exponential backoff on retries.
- Build **idempotent** public endpoints with `Idempotency-Key`.

---

## 11) Folder Layout (baseline)

```
apps/
  api-gateway/        # Public HTTP
  stream-service/     # Ingestion/transcode/publish orchestrator
packages/
  common/             # DTOs, guards, errors, utils
  database/           # TypeORM config, migrations, seeds
  events/             # Event contracts, bus adapters, subjects
```

---

## 12) Definition of Done (DoD)

A change is **done** only if:

1. Tests cover the new behavior and pass locally + CI.
2. Migrations (if any) are present, reversible, and applied in CI.
3. Logs/metrics updated if a new path or consumer is introduced.
4. API/Events are versioned and documented in OpenAPI and event catalog.
5. Rollback plan noted in the PR description.

---

## 13) PR Checklist (paste into PR description)

- [ ] I followed layering (Controller → Service → Domain → Infra); no direct ORM in controllers.
- [ ] All new types are strict; no `any`. DTOs validated. No entity leakage to HTTP.
- [ ] EDA respected: outbox written, events published, consumers idempotent.
- [ ] Migrations written (up/down), backward compatible, indexes considered.
- [ ] Logs/metrics/tracing updated where relevant.
- [ ] Tests: unit + integration/e2e updated; coverage ≥ threshold; non‑flaky.
- [ ] Env/Config validated; secrets not committed.
- [ ] Breaking changes avoided or properly versioned & documented.

---

## 14) Starter Snippets (drop into repo)

**`tsconfig.base.json` (relevant flags)**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "moduleResolution": "node",
    "baseUrl": ".",
    "paths": {
      "@common/*": ["packages/common/*"],
      "@events/*": ["packages/events/*"],
      "@db/*": ["packages/database/*"]
    }
  }
}
```

**ESLint essentials**

```js
// .eslintrc.cjs
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/consistent-type-imports': 'warn',
    'import/order': [
      'warn',
      {
        groups: [
          ['builtin', 'external', 'internal'],
          ['parent', 'sibling', 'index'],
        ],
      },
    ],
    'no-console': 'error',
  },
};
```

**TypeORM config hints**

```ts
// packages/database/ormconfig.ts
export default {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  migrationsRun: false,
  entities: ['dist/**/entities/*.entity.js'],
  migrations: ['dist/**/migrations/*.js'],
} as const;
```

**Outbox table (minimal)**

```sql
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY,
  aggregate_id UUID NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_outbox_published ON outbox_events (published_at);
```

**Idempotency header contract**

```
Request:  Idempotency-Key: <uuid>
Response: Idempotency-Key: <same uuid>
```

---

## 15) When in Doubt

- Prefer a tiny PR that introduces an interface and a failing test, then iterate.
- Default to emitting an **event** instead of calling another module directly.
- If a requirement conflicts with these rules, **update this file** in the same PR and explain why.
