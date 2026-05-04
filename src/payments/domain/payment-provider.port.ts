import { PaymentStatus } from './payment.types';

export const PAYMENT_PROVIDER_PORT = Symbol('IPaymentProviderPort');

export interface CreateInvoiceParams {
  paymentId: string;
  amount: number;
  ccy: number;
  planName: string;
  planId: string;
  redirectUrl: string;
  webHookUrl: string;
}

export interface InvoiceResult {
  invoiceId: string;
  pageUrl: string;
}

export interface WebhookPayload {
  invoiceId: string;
  status: PaymentStatus;
  amount: number;
  ccy: number;
  finalAmount: number;
  reference: string;
  modifiedAt: Date;
}

export interface IPaymentProviderPort {
  readonly providerName: string;
  createInvoice(params: CreateInvoiceParams): Promise<InvoiceResult>;
  parseWebhookBody(body: Record<string, unknown>): WebhookPayload;
  verifyWebhookSignature(rawBody: Buffer, signature: string): Promise<boolean>;
}
