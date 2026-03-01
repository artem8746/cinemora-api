import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export const PdfResponses = {
  GeneratePdfSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  }),

  GeneratePdfBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid HTML content or validation error',
    schema: {
      type: 'object',
      properties: {
        error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Validation Error',
            },
            details: {
              type: 'object',
              properties: {
                html: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['HTML content is required'],
                },
              },
            },
          },
        },
        status: {
          type: 'number',
          example: 400,
        },
      },
    },
  }),
};
