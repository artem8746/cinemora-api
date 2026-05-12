import { PaymentStatus } from './payment.types';
import { ProviderInvoiceState } from './provider-invoice-state';

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

export interface ReceiptResult {
  file: string;
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
  getInvoiceStatus(invoiceId: string): Promise<ProviderInvoiceState>;
  cancelInvoice(invoiceId: string): Promise<void>;
  getReceipt(invoiceId: string): Promise<ReceiptResult>;
}
