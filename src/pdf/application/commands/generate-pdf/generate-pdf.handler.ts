import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { GeneratePdfCommand } from './generate-pdf.command';
import {
  IPdfGeneratorPort,
  PDF_GENERATOR_PORT,
  PdfOptions,
} from '@/pdf/domain/pdf-generator.port';

@CommandHandler(GeneratePdfCommand)
export class GeneratePdfHandler implements ICommandHandler<GeneratePdfCommand> {
  private readonly logger = new Logger(GeneratePdfHandler.name);

  constructor(
    @Inject(PDF_GENERATOR_PORT)
    private readonly pdfGenerator: IPdfGeneratorPort,
  ) {}

  async execute(command: GeneratePdfCommand): Promise<Buffer> {
    const { html } = command;

    this.logger.log('Processing PDF generation command');

    // Validate HTML is not empty
    if (!html || html.trim().length === 0) {
      throw new Error('HTML content cannot be empty');
    }

    const options: PdfOptions = {
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
    };

    const pdfBuffer = await this.pdfGenerator.generatePdf(html, options);

    this.logger.log(`PDF generation completed (${pdfBuffer.length} bytes)`);

    return pdfBuffer;
  }
}

export type GeneratePdfCommandResponse = Buffer;
