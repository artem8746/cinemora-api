import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CreateInvoiceParams,
  InvoiceResult,
  IPaymentProviderPort,
  WebhookPayload,
} from '../../domain/payment-provider.port';
import {
  ProviderInvoiceState,
  providerStateToPaymentStatus,
} from '../../domain/provider-invoice-state';
import { Configuration } from '@/config';

interface PlataInvoiceCreateResponse {
  invoiceId: string;
  pageUrl: string;
}

interface PlataInvoiceStatusResponse {
  status:
    | 'success'
    | 'failure'
    | 'expired'
    | 'reversed'
    | 'processing'
    | 'hold'
    | 'created'
    | null;
}

interface PlataPubKeyResponse {
  key: string;
}

@Injectable()
export class PlataPaymentProviderAdapter
  implements IPaymentProviderPort, OnModuleInit
{
  readonly providerName = 'plata_by_mono';

  private static readonly REQUEST_TIMEOUT_MS = 10_000;
  private static readonly PUBKEY_REFRESH_DEBOUNCE_MS = 60_000;

  private readonly logger = new Logger(PlataPaymentProviderAdapter.name);
  private readonly apiToken: string;
  private readonly baseUrl: string;
  private cachedPublicKeyPem: string | null = null;
  private lastPubKeyRefreshAt = 0;

  constructor(private readonly configService: ConfigService<Configuration>) {
    this.apiToken = configService.getOrThrow('payment.plataApiToken');
    this.baseUrl =
      configService.get('payment.plataApiBaseUrl') ?? 'https://api.monobank.ua';
  }

  async onModuleInit(): Promise<void> {
    await this.refreshPublicKey();
  }

  async createInvoice(params: CreateInvoiceParams): Promise<InvoiceResult> {
    const response = await fetch(
      `${this.baseUrl}/api/merchant/invoice/create`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(
          PlataPaymentProviderAdapter.REQUEST_TIMEOUT_MS,
        ),
        headers: {
          'X-Token': this.apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          ccy: params.ccy,
          merchantPaymInfo: {
            reference: params.paymentId,
            destination: `CareerBoosty — ${params.planName}`,
            basketOrder: [
              {
                name: params.planName,
                qty: 1,
                sum: params.amount,
                total: params.amount,
                code: params.planId,
              },
            ],
          },
          redirectUrl: params.redirectUrl,
          webHookUrl: params.webHookUrl,
          validity: 3600,
          paymentType: 'debit',
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Plata createInvoice failed: ${response.status} — ${errorText}`,
      );
    }

    const data = (await response.json()) as PlataInvoiceCreateResponse;
    return { invoiceId: data.invoiceId, pageUrl: data.pageUrl };
  }

  async getInvoiceStatus(invoiceId: string): Promise<ProviderInvoiceState> {
    const url = `${this.baseUrl}/api/merchant/invoice/status?invoiceId=${encodeURIComponent(invoiceId)}`;
    const response = await fetch(url, {
      signal: AbortSignal.timeout(
        PlataPaymentProviderAdapter.REQUEST_TIMEOUT_MS,
      ),
      headers: { 'X-Token': this.apiToken },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Plata getInvoiceStatus failed: ${response.status} — ${errorText}`,
      );
    }

    const data = (await response.json()) as PlataInvoiceStatusResponse;
    return this.mapInvoiceState(data.status ?? '');
  }

  async cancelInvoice(invoiceId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/api/merchant/invoice/cancel`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(
          PlataPaymentProviderAdapter.REQUEST_TIMEOUT_MS,
        ),
        headers: {
          'X-Token': this.apiToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoiceId }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Plata cancelInvoice failed: ${response.status} — ${errorText}`,
      );
    }
  }

  parseWebhookBody(body: Record<string, unknown>): WebhookPayload {
    const invoiceId = body['invoiceId'];
    const statusRaw = body['status'];
    const amount = body['amount'];
    const ccy = body['ccy'];
    const finalAmount = body['finalAmount'];
    const reference = body['reference'];
    const modifiedDate = body['modifiedDate'];

    if (typeof invoiceId !== 'string' || invoiceId.length === 0) {
      throw new BadRequestException('Webhook: invalid invoiceId');
    }
    if (typeof statusRaw !== 'string') {
      throw new BadRequestException('Webhook: invalid status');
    }
    if (!Number.isInteger(amount) || (amount as number) < 0) {
      throw new BadRequestException('Webhook: invalid amount');
    }
    if (!Number.isInteger(ccy)) {
      throw new BadRequestException('Webhook: invalid ccy');
    }
    if (
      finalAmount !== undefined &&
      (!Number.isInteger(finalAmount) || (finalAmount as number) < 0)
    ) {
      throw new BadRequestException('Webhook: invalid finalAmount');
    }
    if (reference !== undefined && typeof reference !== 'string') {
      throw new BadRequestException('Webhook: invalid reference');
    }
    if (typeof modifiedDate !== 'string') {
      throw new BadRequestException('Webhook: invalid modifiedDate');
    }
    const modifiedAt = new Date(modifiedDate);
    if (Number.isNaN(modifiedAt.getTime())) {
      throw new BadRequestException('Webhook: unparseable modifiedDate');
    }

    const numericAmount = amount as number;
    const numericFinal =
      typeof finalAmount === 'number' ? finalAmount : numericAmount;
    const stringReference = typeof reference === 'string' ? reference : '';

    return {
      invoiceId,
      status: providerStateToPaymentStatus(this.mapInvoiceState(statusRaw)),
      amount: numericAmount,
      ccy: ccy as number,
      finalAmount: numericFinal,
      reference: stringReference,
      modifiedAt,
    };
  }

  async verifyWebhookSignature(
    rawBody: Buffer,
    signature: string,
  ): Promise<boolean> {
    if (!signature) return false;

    try {
      if (await this.verifyWith(rawBody, signature)) return true;

      // Cached key may be stale (Mono rotated it). Refresh and retry once,
      // but no more than once per debounce window to avoid hammering Mono
      // when invalid signatures arrive in bursts.
      const sinceLastRefresh = Date.now() - this.lastPubKeyRefreshAt;
      if (
        sinceLastRefresh <
        PlataPaymentProviderAdapter.PUBKEY_REFRESH_DEBOUNCE_MS
      ) {
        return false;
      }
      this.logger.warn(
        'Webhook signature mismatch — refreshing Plata public key and retrying',
      );
      await this.refreshPublicKey();
      return await this.verifyWith(rawBody, signature);
    } catch (err) {
      this.logger.error('Webhook signature verification failed', err);
      return false;
    }
  }

  private async verifyWith(
    rawBody: Buffer,
    signature: string,
  ): Promise<boolean> {
    const publicKey = await this.getPublicKey();
    const verifier = crypto.createVerify('SHA256');
    verifier.update(rawBody);
    return verifier.verify(publicKey, Buffer.from(signature, 'base64'));
  }

  private async getPublicKey(): Promise<string> {
    if (!this.cachedPublicKeyPem) {
      await this.refreshPublicKey();
    }
    if (!this.cachedPublicKeyPem) {
      throw new Error('Plata public key is not available');
    }
    return this.cachedPublicKeyPem;
  }

  private async refreshPublicKey(): Promise<void> {
    this.lastPubKeyRefreshAt = Date.now();
    try {
      const response = await fetch(`${this.baseUrl}/api/merchant/pubkey`, {
        signal: AbortSignal.timeout(
          PlataPaymentProviderAdapter.REQUEST_TIMEOUT_MS,
        ),
        headers: { 'X-Token': this.apiToken },
      });

      if (!response.ok) {
        throw new Error(`Plata pubkey fetch failed: ${response.status}`);
      }

      const data = (await response.json()) as PlataPubKeyResponse;
      this.cachedPublicKeyPem = Buffer.from(data.key, 'base64').toString(
        'utf8',
      );
      this.logger.log('Plata public key refreshed');
    } catch (err) {
      this.logger.error('Failed to fetch Plata public key', err);
    }
  }

  private mapInvoiceState(plataStatus: string): ProviderInvoiceState {
    switch (plataStatus) {
      case 'success':
        return { kind: 'success' };
      case 'failure':
        return { kind: 'failed' };
      case 'expired':
        return { kind: 'expired' };
      case 'reversed':
        return { kind: 'reversed' };
      case 'created':
        return { kind: 'pending_cancellable' };
      case 'processing':
      case 'hold':
        return { kind: 'pending_in_flight' };
      // Unknown / null — be conservative: assume the invoice may still be
      // settling and let the scheduler retry instead of cancelling it.
      default:
        return { kind: 'pending_in_flight' };
    }
  }
}
