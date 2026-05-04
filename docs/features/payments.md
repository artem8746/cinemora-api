# Payments

## Purpose

Accept payments via an external provider, persist payment records, and expose catalog and payment history for authenticated users.

## Business rules

- Payment history listing is scoped to the current user and ordered by `createdAt` descending.
- List endpoint is paginated: `page` (1-based, default 1), `limit` (1–100, default 20).

## Architecture and dependencies

- Shared list shape: `PaginatedResult<T>` and `PaginationMeta` in `src/common/types/pagination.ts`.
- Module: `src/payments/`
- CQRS queries/commands for invoice creation, webhook handling, catalog, payments list, payment by id.
- `PaymentsService` executes TypeORM queries; provider integration via `PAYMENT_PROVIDER_PORT`.

## API/contracts

- `GET /payments` — JWT; query: `page`, `limit`; response `{ items: Payment[], meta: { page, limit, total, totalPages } }`.
- Other routes: invoice creation, catalog, webhook, single payment — see controller and Swagger.

## Data model and migrations

- See `payment.entity.ts`, `payment-plan.entity.ts`, `payment-settings.entity.ts` and migrations under `src/database/migrations/`.

## Edge cases and known limitations

- When `total` is 0, `totalPages` is 0.
- Webhook handler returns 200 even on processing errors (provider retry avoidance).

## How to change safely in future

- Keep list sorting and filters in `PaymentsService` / query handler; controllers stay thin.
- If adding filters, extend `GetPaymentsQuery` and DTO together; bump OpenAPI in `swagger/response.ts`.

## Related files

- `src/payments/presentation/payments.controller.ts`
- `src/payments/application/queries/get-payments/`
- `src/payments/presentation/dto/get-payments-query.dto.ts`
- `src/payments/swagger/request.ts`, `src/payments/swagger/response.ts`
