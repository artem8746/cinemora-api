export const IDEMPOTENCY_STORE = Symbol('IIdempotencyStore');

export interface IdempotencyOptions {
  /** Logical bucket — prevents key collisions between unrelated features. */
  namespace: string;
  /** Caller-supplied idempotency key. */
  key: string;
  /** TTL for the cached result. Default 24h. */
  resultTtlSec?: number;
  /** TTL for the lock guarding concurrent first-time execution. Default 60s. */
  lockTtlSec?: number;
}

export interface IIdempotencyStore {
  /**
   * Run `operation` at most once per (namespace, key). Subsequent calls within
   * `resultTtlSec` return the cached result. Concurrent first-time callers see
   * one execution; the rest receive a 409. On a Redis outage the store fails
   * closed (503) — never silently degrades.
   */
  execute<T>(
    options: IdempotencyOptions,
    operation: () => Promise<T>,
  ): Promise<T>;
}
