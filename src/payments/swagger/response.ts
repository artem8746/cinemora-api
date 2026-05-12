import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const PaymentResponses = {
  CreateInvoiceSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice created successfully',
    schema: {
      type: 'object',
      properties: {
        paymentId: {
          type: 'string',
          format: 'uuid',
          example: '7aa7f457-b4fc-4d9c-8f9a-5a28356e94f4',
        },
        pageUrl: {
          type: 'string',
          format: 'uri',
          example: 'https://plata.by/checkout/abc123',
        },
      },
      required: ['paymentId', 'pageUrl'],
    },
  }),

  CreateInvoiceBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Validation failed, idempotency-key header is missing, or payload contains invalid plan/token options',
  }),

  CreateInvoiceUnauthorized: ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  }),

  GetCatalogSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Catalog fetched successfully',
    schema: {
      type: 'object',
      properties: {
        plans: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'starter' },
              name: { type: 'string', example: 'Starter Pack' },
              creditsAmount: { type: 'integer', example: 100 },
              price: { type: 'integer', example: 499 },
              currency: { type: 'string', example: 'BYN' },
              ccy: { type: 'integer', example: 933 },
              isActive: { type: 'boolean', example: true },
              order: { type: 'integer', example: 1 },
              badge: {
                oneOf: [{ type: 'string' }, { type: 'null' }],
                example: 'Popular',
              },
              blurb: {
                oneOf: [{ type: 'string' }, { type: 'null' }],
                example: 'Best value for money',
              },
            },
            required: [
              'id',
              'name',
              'creditsAmount',
              'price',
              'currency',
              'ccy',
              'isActive',
              'order',
              'badge',
              'blurb',
            ],
          },
        },
        tokenPricePerUnit: { type: 'integer', example: 20 },
        tokenCurrency: { type: 'string', example: 'BYN' },
        tokenCcy: { type: 'integer', example: 933 },
      },
      required: ['plans', 'tokenPricePerUnit', 'tokenCurrency', 'tokenCcy'],
    },
  }),

  GetPaymentsSuccess: ApiResponse({
    status: HttpStatus.OK,
    description:
      'Payment history fetched successfully (paged); items sorted by newest first',
    schema: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              planId: { type: 'string', example: 'starter' },
              amount: { type: 'integer', example: 499 },
              currency: { type: 'string', example: 'BYN' },
              creditsAmount: { type: 'integer', example: 100 },
              status: { type: 'string', example: 'PENDING' },
              providerName: { type: 'string', example: 'plata' },
              providerInvoiceId: {
                oneOf: [{ type: 'string' }, { type: 'null' }],
                example: 'invoice_123',
              },
              invoiceUrl: {
                oneOf: [{ type: 'string', format: 'uri' }, { type: 'null' }],
                example: 'https://plata.by/checkout/abc123',
              },
              providerData: {
                oneOf: [{ type: 'object' }, { type: 'null' }],
                additionalProperties: true,
              },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
            required: [
              'id',
              'userId',
              'planId',
              'amount',
              'currency',
              'creditsAmount',
              'status',
              'providerName',
              'providerInvoiceId',
              'invoiceUrl',
              'providerData',
              'createdAt',
              'updatedAt',
            ],
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
          required: ['page', 'limit', 'total', 'totalPages'],
        },
      },
      required: ['items', 'meta'],
    },
  }),

  GetPaymentsUnauthorized: ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User is not authenticated',
  }),

  GetPaymentByIdSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment fetched successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        userId: { type: 'string', format: 'uuid' },
        planId: { type: 'string', example: 'starter' },
        amount: { type: 'integer', example: 499 },
        currency: { type: 'string', example: 'BYN' },
        creditsAmount: { type: 'integer', example: 100 },
        status: { type: 'string', example: 'PENDING' },
        providerName: { type: 'string', example: 'plata' },
        providerInvoiceId: {
          oneOf: [{ type: 'string' }, { type: 'null' }],
          example: 'invoice_123',
        },
        invoiceUrl: {
          oneOf: [{ type: 'string', format: 'uri' }, { type: 'null' }],
          example: 'https://plata.by/checkout/abc123',
        },
        providerData: {
          oneOf: [{ type: 'object' }, { type: 'null' }],
          additionalProperties: true,
        },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
      required: [
        'id',
        'userId',
        'planId',
        'amount',
        'currency',
        'creditsAmount',
        'status',
        'providerName',
        'providerInvoiceId',
        'invoiceUrl',
        'providerData',
        'createdAt',
        'updatedAt',
      ],
    },
  }),

  GetPaymentByIdNotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found or does not belong to the current user',
  }),

  PlataWebhookAccepted: ApiResponse({
    status: HttpStatus.OK,
    description:
      'Webhook accepted. Endpoint always responds with HTTP 200 to avoid provider retries.',
  }),
};
