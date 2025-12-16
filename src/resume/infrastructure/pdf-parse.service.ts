import { Injectable, Logger } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';
import { IPdfParserPort, PdfParseResult } from '../domain/pdf-parser.port';

@Injectable()
export class PdfParseService implements IPdfParserPort {
  private readonly logger = new Logger(PdfParseService.name);

  async getText(buffer: Buffer): Promise<PdfParseResult> {
    this.logger.log('Parsing PDF buffer');

    const pdfParse = new PDFParse({
      data: buffer,
    });

    try {
      const data = await pdfParse.getText();
      this.logger.log(`PDF parsed successfully`);

      return {
        text: data.text,
      };
    } catch (error) {
      this.logger.error('Failed to parse PDF', error);
      throw new Error(
        `PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
