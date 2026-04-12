import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeController } from './presentation/resume.controller';
import { ResumeCustomizationService } from './application/resume-customization.service';
import { ResumeParsePdfService } from './application/resume-parse-pdf.service';
import { ResumeService } from './application/resume.service';
import { PdfParseService } from './infrastructure/pdf-parse.service';
import { ParseResumeHandler } from './application/commands/parse-resume/parse-resume.handler';
import { SaveResumeHandler } from './application/commands/save-resume/save-resume.handler';
import { CompareResumeHandler } from './application/queries/compare-resume/compare-resume.handler';
import { ResolveSourceResumeHandler } from './application/queries/resolve-source-resume/resolve-source-resume.handler';
import { GetResumeHandler } from './application/queries/get-resume/get-resume.handler';
import { PDF_PARSER_PORT } from './domain/pdf-parser.port';
import { PDF_LINK_PARSER_PORT } from './domain/pdf-link-parser.port';
import { PdfLinkParserService } from './infrastructure/pdf-link-parser.service';
import { Resume } from './resume.entity';

export const CommandHandlers = [ParseResumeHandler, SaveResumeHandler];
export const QueryHandlers = [
  CompareResumeHandler,
  ResolveSourceResumeHandler,
  GetResumeHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Resume])],
  controllers: [ResumeController],
  providers: [
    ResumeParsePdfService,
    ResumeService,
    ResumeCustomizationService,
    {
      provide: PDF_PARSER_PORT,
      useClass: PdfParseService,
    },
    {
      provide: PDF_LINK_PARSER_PORT,
      useClass: PdfLinkParserService,
    },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [ResumeService],
})
export class ResumeModule {}
