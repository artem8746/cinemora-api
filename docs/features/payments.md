# Payments

## Purpose

Accept payments via an external provider, persist payment records, and expose catalog and payment history for authenticated users.

## Business rules

- Payment history listing is scoped to the current user and ordered by `createdAt` descending.
- List endpoint is paginated: `page` (1-based, default 1), `limit` (1–100, default 20).
- Receipt is available only for the payment owner and only when `status === SUCCESS` and `providerInvoiceId` is set. Non-owners get `404` (same as missing) to avoid id enumeration; valid owners with non-eligible payments get `409 Conflict`.

## Architecture and dependencies

- Shared list shape: `PaginatedResult<T>` and `PaginationMeta` in `src/common/types/pagination.ts`.
- Module: `src/payments/`
- CQRS queries/commands for invoice creation, webhook handling, catalog, payments list, payment by id.
- `PaymentsService` executes TypeORM queries; provider integration via `PAYMENT_PROVIDER_PORT`.

## API/contracts

- `GET /payments` — JWT; query: `page`, `limit`; response `{ items: Payment[], meta: { page, limit, total, totalPages } }`.
- `GET /payments/:id/receipt` — JWT; returns `{ pdfBase64: string, mimeType: 'application/pdf' }` proxied from Plata `GET /api/merchant/invoice/receipt`. Errors: `404` (not found / foreign), `409` (status not SUCCESS or no provider invoice), `502` (provider unavailable).
- Other routes: invoice creation, catalog, webhook, single payment — see controller and Swagger.

## Data model and migrations

- See `payment.entity.ts`, `payment-plan.entity.ts`, `payment-settings.entity.ts` and migrations under `src/database/migrations/`.

## Edge cases and known limitations

- When `total` is 0, `totalPages` is 0.
- Webhook handler returns 200 even on processing errors (provider retry avoidance).
- Receipt response from Plata is base64-encoded PDF (`{ file: string }`), not a URL — we pass it through as `pdfBase64`. The frontend reconstructs the blob locally. We do not persist receipts on our side; each request hits the provider.

## How to change safely in future

- Keep list sorting and filters in `PaymentsService` / query handler; controllers stay thin.
- If adding filters, extend `GetPaymentsQuery` and DTO together; bump OpenAPI in `swagger/response.ts`.

## Related files

- `src/payments/presentation/payments.controller.ts`
- `src/payments/application/queries/get-payments/`
- `src/payments/application/queries/get-payment-receipt/`
- `src/payments/domain/payment-provider.port.ts` — `getReceipt(invoiceId)` contract
- `src/payments/infrastructure/plata/plata-payment-provider.adapter.ts` — calls `GET /api/merchant/invoice/receipt`
- `src/payments/presentation/dto/get-payments-query.dto.ts`
- `src/payments/swagger/request.ts`, `src/payments/swagger/response.ts`
