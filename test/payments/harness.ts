import * as crypto from 'crypto';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AddressInfo } from 'net';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CommandBus } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';
import { MockPlataServer } from './mock-plata';

// ---- one-time env bootstrap -----------------------------------------------
// Done at module load so the dynamic import of AppModule below sees overrides.
let envLoaded = false;
function loadEnv(): void {
  if (envLoaded) return;
  const envFile = process.env.ENV_PATH?.length ? process.env.ENV_PATH : '.env';
  dotenv.config({ path: path.resolve(process.cwd(), envFile) });
  envLoaded = true;
}

export interface TestHarness {
  app: NestFastifyApplication;
  apiBase: string;
  ds: DataSource;
  commandBus: CommandBus;
  mock: MockPlataServer;
}

export async function bootHarness(): Promise<TestHarness> {
  loadEnv();
  const mock = new MockPlataServer();
  const plataBaseUrl = await mock.start();

  process.env.PLATA_API_BASE_URL = plataBaseUrl;
  process.env.PLATA_API_TOKEN = 'test-mock-token';
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    process.env.NODE_ENV = 'development';
  }
  // Silence Pino HTTP logging (req/res firehose). Only takes effect because
  // AppModule's LoggerModule.forRoot reads LOG_LEVEL.
  process.env.LOG_LEVEL = process.env.LOG_LEVEL ?? 'silent';

  // Dynamic import so process.env overrides above land before AppModule's
  // ConfigModule reads them.
  const { AppModule } = await import('../../src/app.module');

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { rawBody: true, logger: false },
  );
  app.setGlobalPrefix('api');
  await app.listen({ port: 0, host: '127.0.0.1' });

  const addr = app.getHttpServer().address() as AddressInfo;
  const apiBase = `http://127.0.0.1:${addr.port}`;

  return {
    app,
    apiBase,
    ds: app.get(DataSource),
    commandBus: app.get(CommandBus),
    mock,
  };
}

export async function shutdownHarness(h: TestHarness): Promise<void> {
  await h.app.close();
  await h.mock.stop();
}

// ---- per-test fixtures ----------------------------------------------------

export interface TestUser {
  id: string;
  email: string;
}

export async function createTestUser(ds: DataSource): Promise<TestUser> {
  // Unique email per test so a stray FK/cascade leak from a prior run can't
  // collide on `users.email`'s unique constraint.
  const email = `e2e-payments-${Date.now()}-${crypto.randomBytes(4).toString('hex')}@test.local`;
  const inserted = await ds.query<{ id: string }[]>(
    `INSERT INTO users (email, is_confirmed, credits) VALUES ($1, true, 0) RETURNING id`,
    [email],
  );
  const row = inserted[0];
  if (!row)
    throw new Error('createTestUser: INSERT ... RETURNING returned no row');
  return { id: row.id, email };
}

/**
 * Narrow `T | null | undefined` to `T` or throw — usable in tests where we
 * know a value must be set after a prior step, but TS can't prove it.
 */
export function defined<T>(value: T | null | undefined, label = 'value'): T {
  if (value === null || value === undefined) {
    throw new Error(`expected ${label} to be defined`);
  }
  return value;
}

export async function deleteTestUser(
  ds: DataSource,
  userId: string,
): Promise<void> {
  // payment_webhooks is not cascaded by users → payments delete, clean by id.
  await ds.query(
    `DELETE FROM payment_webhooks
       WHERE payment_id IN (SELECT id FROM payments WHERE user_id = $1)`,
    [userId],
  );
  await ds.query(`DELETE FROM payments WHERE user_id = $1`, [userId]);
  await ds.query(`DELETE FROM users WHERE id = $1`, [userId]);
}

export async function getUserCredits(
  ds: DataSource,
  userId: string,
): Promise<number> {
  const rows = await ds.query<{ credits: number }[]>(
    `SELECT credits FROM users WHERE id = $1`,
    [userId],
  );
  return rows[0]?.credits ?? -1;
}

export async function backdatePayment(
  ds: DataSource,
  paymentId: string,
  intervalSql = "interval '2 hours'",
): Promise<void> {
  await ds.query(
    `UPDATE payments SET created_at = now() - ${intervalSql} WHERE id = $1`,
    [paymentId],
  );
}

// ---- webhook poster -------------------------------------------------------

export interface WebhookPostOptions {
  signatureOverride?: string;
  bodyOverride?: string;
}

export type WebhookPoster = (
  body: Record<string, unknown>,
  options?: WebhookPostOptions,
) => Promise<{ status: number; body: string }>;

export function makeWebhookPoster(h: TestHarness): WebhookPoster {
  return async (body, options) => {
    const rawBody = Buffer.from(
      options?.bodyOverride ?? JSON.stringify(body),
      'utf8',
    );
    const signature = options?.signatureOverride ?? h.mock.signWebhook(rawBody);
    const res = await fetch(`${h.apiBase}/api/payments/webhook/plata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sign': signature,
      },
      body: rawBody,
    });
    return { status: res.status, body: await res.text() };
  };
}

export function nowIso(offsetMs = 0): string {
  return new Date(Date.now() + offsetMs).toISOString();
}
