import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ResumeController } from './presentation/resume.controller';
import { ResumeAnalysisService } from './application/resume-analysis.service';
import { PdfParseService } from './infrastructure/pdf-parse.service';
import { ParseResumeHandler } from './application/commands/parse-resume/parse-resume.handler';
import { PDF_PARSER_PORT } from './domain/pdf-parser.port';
import { PDF_LINK_PARSER_PORT } from './domain/pdf-link-parser.port';
import { PdfLinkParserService } from './infrastructure/pdf-link-parser.service';

export const CommandHandlers = [ParseResumeHandler];

@Module({
  imports: [CqrsModule],
  controllers: [ResumeController],
  providers: [
    ResumeAnalysisService,
    {
      provide: PDF_PARSER_PORT,
      useClass: PdfParseService,
    },
    {
      provide: PDF_LINK_PARSER_PORT,
      useClass: PdfLinkParserService,
    },
    ...CommandHandlers,
  ],
})
export class ResumeModule {}
