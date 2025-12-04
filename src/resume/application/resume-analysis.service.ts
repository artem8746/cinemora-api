import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPdfParserPort, PDF_PARSER_PORT } from '../domain/pdf-parser.port';
import {
  IPdfLinkParserPort,
  PDF_LINK_PARSER_PORT,
} from '@/files/domain/pdf-link-parser.port';
import { UploadedFile } from '@/files/presentation/types/file.interface';
import { ResumeRawContent } from '../presentation/types/resume';

@Injectable()
export class ResumeAnalysisService {
  private readonly logger = new Logger(ResumeAnalysisService.name);

  constructor(
    @Inject(PDF_PARSER_PORT)
    private readonly pdfParser: IPdfParserPort,
    @Inject(PDF_LINK_PARSER_PORT)
    private readonly pdfLinkParser: IPdfLinkParserPort,
  ) {}

  async getResumeRawContent(file: UploadedFile): Promise<ResumeRawContent> {
    this.logger.log(`Analyzing resume: ${file.filename}`);

    const [result, links] = await Promise.all([
      this.pdfParser.getText(file.buffer),
      this.pdfLinkParser.extractLinks(file.buffer),
    ]);

    return {
      ...result,
      links,
    };
  }
}
