import {
  Controller,
  Post,
  Body,
  UseGuards,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';
import { GeneratePdfCommand } from '../application/commands/generate-pdf/generate-pdf.command';
import { GeneratePdfCommandResponse } from '../application/commands/generate-pdf/generate-pdf.handler';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { PdfRequests } from '../swagger/request';
import { PdfResponses } from '../swagger/response';

@ApiTags('pdf')
@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF from HTML content' })
  @ApiConsumes('application/json')
  @PdfRequests.GeneratePdfRequest
  @PdfResponses.GeneratePdfSuccess
  @PdfResponses.GeneratePdfBadRequest
  async generate(
    @Body() generatePdfDto: GeneratePdfDto,
    @CurrentUserId() userId: string,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    const pdfBuffer = await this.commandBus.execute<
      GeneratePdfCommand,
      GeneratePdfCommandResponse
    >(new GeneratePdfCommand(generatePdfDto.html));

    reply
      .type('application/pdf')
      .header('Content-Disposition', 'attachment; filename="generated.pdf"')
      .header('Content-Length', pdfBuffer.length.toString())
      .status(HttpStatus.OK)
      .send(pdfBuffer);
  }
}
