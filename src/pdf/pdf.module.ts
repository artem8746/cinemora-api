import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PdfController } from './presentation/pdf.controller';
import { GeneratePdfHandler } from './application/commands/generate-pdf/generate-pdf.handler';
import { PDF_GENERATOR_PORT } from './domain/pdf-generator.port';
import { PuppeteerPdfGeneratorService } from './infrastructure/puppeteer-pdf-generator.service';

export const CommandHandlers = [GeneratePdfHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PdfController],
  providers: [
    {
      provide: PDF_GENERATOR_PORT,
      useClass: PuppeteerPdfGeneratorService,
    },
    ...CommandHandlers,
  ],
  exports: [PDF_GENERATOR_PORT],
})
export class PdfModule {}
