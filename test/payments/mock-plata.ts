import * as crypto from 'crypto';
import * as http from 'http';
import { AddressInfo } from 'net';

export type PlataStatus =
  | 'success'
  | 'failure'
  | 'expired'
  | 'reversed'
  | 'processing'
  | 'hold'
  | 'created'
  | null;

export interface MockInvoice {
  status: PlataStatus;
  // Each getInvoiceStatus shifts the head; falls back to `status` when empty.
  // Lets one scenario simulate state transitions across successive calls
  // (e.g. created → success between scheduler's getStatus and refetch).
  statusQueue: PlataStatus[];
  cancelShouldFail: boolean;
  statusShouldFail: boolean;
}

interface MockState {
  invoices: Map<string, MockInvoice>;
  createShouldFail: boolean;
  invoiceCounter: number;
}

export class MockPlataServer {
  private readonly server: http.Server;
  private readonly privateKey: crypto.KeyObject;
  readonly publicKeyPem: string;
  readonly publicKeyB64: string;
  private readonly state: MockState = {
    invoices: new Map(),
    createShouldFail: false,
    invoiceCounter: 0,
  };

  constructor() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'P-256',
    });
    this.privateKey = privateKey;
    this.publicKeyPem = publicKey.export({
      type: 'spki',
      format: 'pem',
    }) as string;
    this.publicKeyB64 = Buffer.from(this.publicKeyPem, 'utf8').toString(
      'base64',
    );
    // Arrow wrapper instead of `.bind(this)` — `Function.prototype.bind` is
    // typed with `...args: any[]` and widens the listener to `any`.
    this.server = http.createServer((req, res) => this.handle(req, res));
  }

  async start(): Promise<string> {
    await new Promise<void>((resolve) =>
      this.server.listen(0, '127.0.0.1', resolve),
    );
    const addr = this.server.address() as AddressInfo;
    return `http://127.0.0.1:${addr.port}`;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) =>
      this.server.close((err) => (err ? reject(err) : resolve())),
    );
  }

  reset(): void {
    this.state.invoices.clear();
    this.state.createShouldFail = false;
  }

  setCreateShouldFail(value: boolean): void {
    this.state.createShouldFail = value;
  }

  setInvoice(id: string, patch: Partial<MockInvoice>): void {
    const prev = this.state.invoices.get(id) ?? {
      status: 'created' as PlataStatus,
      statusQueue: [],
      cancelShouldFail: false,
      statusShouldFail: false,
    };
    this.state.invoices.set(id, { ...prev, ...patch });
  }

  signWebhook(rawBody: Buffer): string {
    const sign = crypto.createSign('SHA256');
    sign.update(rawBody);
    sign.end();
    return sign.sign(this.privateKey).toString('base64');
  }

  private handle(req: http.IncomingMessage, res: http.ServerResponse): void {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      res.setHeader('Content-Type', 'application/json');

      if (url.pathname === '/api/merchant/pubkey' && req.method === 'GET') {
        res.statusCode = 200;
        res.end(JSON.stringify({ key: this.publicKeyB64 }));
        return;
      }

      if (
        url.pathname === '/api/merchant/invoice/create' &&
        req.method === 'POST'
      ) {
        if (this.state.createShouldFail) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'simulated provider failure' }));
          return;
        }
        this.state.invoiceCounter += 1;
        const invoiceId = `mock-inv-${this.state.invoiceCounter}-${Date.now()}`;
        this.setInvoice(invoiceId, { status: 'created' });
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            invoiceId,
            pageUrl: `http://mock-plata.local/checkout/${invoiceId}`,
          }),
        );
        return;
      }

      if (
        url.pathname === '/api/merchant/invoice/status' &&
        req.method === 'GET'
      ) {
        const invoiceId = url.searchParams.get('invoiceId') ?? '';
        const inv = this.state.invoices.get(invoiceId);
        if (inv?.statusShouldFail) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'simulated status failure' }));
          return;
        }
        if (!inv) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'unknown invoice' }));
          return;
        }
        const reported =
          inv.statusQueue.length > 0
            ? (inv.statusQueue.shift() as PlataStatus)
            : inv.status;
        res.statusCode = 200;
        res.end(JSON.stringify({ status: reported }));
        return;
      }

      if (
        url.pathname === '/api/merchant/invoice/cancel' &&
        req.method === 'POST'
      ) {
        const parsed = JSON.parse(body || '{}') as { invoiceId?: string };
        const invoiceId = parsed.invoiceId ?? '';
        const inv = this.state.invoices.get(invoiceId);
        if (!inv) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'unknown invoice' }));
          return;
        }
        if (inv.cancelShouldFail) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'simulated cancel failure' }));
          return;
        }
        inv.status = 'expired';
        res.statusCode = 200;
        res.end(JSON.stringify({ ok: true }));
        return;
      }

      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not found' }));
    });
  }
}
