import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { CreateInvoiceDto } from '../presentation/dto/create-invoice.dto';

export const PaymentRequests = {
  GetPaymentsQuery: applyDecorators(
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number (1-based). Defaults to 1.',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Page size (1–100). Defaults to 20.',
      example: 20,
    }),
  ),

  CreateInvoiceIdempotencyKeyHeader: ApiHeader({
    name: 'idempotency-key',
    required: true,
    description:
      'Unique request key for deduplication. Reusing the same key returns the first successful response.',
    example: '16f2f4d8-4f56-47d1-b793-6c50de4fd580',
  }),

  CreateInvoiceBody: ApiBody({ type: CreateInvoiceDto }),

  PlataWebhookSignatureHeader: ApiHeader({
    name: 'x-sign',
    required: false,
    description: 'Plata signature for webhook payload verification',
    example: 'sha256=4ce749f6d5f4a1e25f2d1ed869f728f7',
  }),

  PlataWebhookBody: ApiBody({
    schema: {
      type: 'object',
      additionalProperties: true,
      description: 'Raw webhook payload from Plata provider',
    },
  }),
};
