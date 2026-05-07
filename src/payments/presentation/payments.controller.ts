import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { CreateInvoiceCommand } from '../application/commands/create-invoice/create-invoice.command';
import type { CreateInvoiceCommandResponse } from '../application/commands/create-invoice/create-invoice.handler';
import { HandleWebhookCommand } from '../application/commands/handle-webhook/handle-webhook.command';
import { GetPaymentsQuery } from '../application/queries/get-payments/get-payments.query';
import type { GetPaymentsQueryResponse } from '../application/queries/get-payments/get-payments.handler';
import { GetCatalogQuery } from '../application/queries/get-catalog/get-catalog.query';
import type { GetCatalogQueryResponse } from '../application/queries/get-catalog/get-catalog.handler';
import { GetPaymentByIdQuery } from '../application/queries/get-payment-by-id/get-payment-by-id.query';
import type { GetPaymentByIdQueryResponse } from '../application/queries/get-payment-by-id/get-payment-by-id.handler';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { GetPaymentsQueryDto } from './dto/get-payments-query.dto';
import { PaymentRequests } from '../swagger/request';
import { PaymentResponses } from '../swagger/response';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('invoice')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment invoice and get checkout URL' })
  @PaymentRequests.CreateInvoiceIdempotencyKeyHeader
  @PaymentRequests.CreateInvoiceBody
  @PaymentResponses.CreateInvoiceSuccess
  @PaymentResponses.CreateInvoiceBadRequest
  @PaymentResponses.CreateInvoiceUnauthorized
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentUserId() userId: string,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<CreateInvoiceCommandResponse> {
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required');
    }
    return await this.commandBus.execute<
      CreateInvoiceCommand,
      CreateInvoiceCommandResponse
    >(
      new CreateInvoiceCommand(
        userId,
        idempotencyKey,
        dto.planId,
        dto.tokenAmount,
      ),
    );
  }

  @Get('catalog')
  @ApiOperation({ summary: 'Get available payment plans and token price' })
  @PaymentResponses.GetCatalogSuccess
  getCatalog(): Promise<GetCatalogQueryResponse> {
    return this.queryBus.execute<GetCatalogQuery, GetCatalogQueryResponse>(
      new GetCatalogQuery(),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user payment history',
    description:
      'Paged list sorted by newest first (`page`, `limit` query params).',
  })
  @PaymentRequests.GetPaymentsQuery
  @PaymentResponses.GetPaymentsSuccess
  @PaymentResponses.GetPaymentsUnauthorized
  async getPayments(
    @CurrentUserId() userId: string,
    @Query() pagination: GetPaymentsQueryDto,
  ): Promise<GetPaymentsQueryResponse> {
    return await this.queryBus.execute<
      GetPaymentsQuery,
      GetPaymentsQueryResponse
    >(new GetPaymentsQuery(userId, pagination.page, pagination.limit));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single payment by id (current user only)' })
  @PaymentResponses.GetPaymentByIdSuccess
  @PaymentResponses.GetPaymentByIdNotFound
  @PaymentResponses.GetPaymentsUnauthorized
  async getPaymentById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUserId() userId: string,
  ): Promise<GetPaymentByIdQueryResponse> {
    return await this.queryBus.execute<
      GetPaymentByIdQuery,
      GetPaymentByIdQueryResponse
    >(new GetPaymentByIdQuery(id, userId));
  }

  @Post('webhook/plata')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Plata by Mono webhook receiver' })
  @PaymentRequests.PlataWebhookSignatureHeader
  @PaymentRequests.PlataWebhookBody
  @PaymentResponses.PlataWebhookAccepted
  async handlePlataWebhook(
    @Req() req: FastifyRequest & { rawBody?: Buffer },
    @Body() body: Record<string, unknown>,
    @Headers('x-sign') signature: string,
  ): Promise<void> {
    if (!req.rawBody) {
      throw new BadRequestException('Raw request body is required');
    }
    if (!signature) {
      throw new BadRequestException('X-Sign header is required');
    }
    try {
      await this.commandBus.execute(
        new HandleWebhookCommand(req.rawBody, signature, body),
      );
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error('Plata webhook processing failed', err);
      throw new ServiceUnavailableException(
        'Webhook processing failed, please retry',
      );
    }
  }
}
