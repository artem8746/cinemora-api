import { Global, Module } from '@nestjs/common';
import { IDEMPOTENCY_STORE } from './idempotency-store.port';
import { RedisIdempotencyStore } from './redis-idempotency-store';

@Global()
@Module({
  providers: [
    {
      provide: IDEMPOTENCY_STORE,
      useClass: RedisIdempotencyStore,
    },
  ],
  exports: [IDEMPOTENCY_STORE],
})
export class IdempotencyModule {}
