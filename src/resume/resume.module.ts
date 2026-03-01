import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeController } from './presentation/resume.controller';
import { ResumeCustomizationService } from './application/resume-customization.service';
import { ResumeAnalysisService } from './application/resume-analysis.service';
import { ResumeService } from './application/resume.service';
import { PdfParseService } from './infrastructure/pdf-parse.service';
import { ParseResumeHandler } from './application/commands/parse-resume/parse-resume.handler';
import { CompareResumeHandler } from './application/queries/compare-resume/compare-resume.handler';
import { PDF_PARSER_PORT } from './domain/pdf-parser.port';
import { PDF_LINK_PARSER_PORT } from './domain/pdf-link-parser.port';
import { PdfLinkParserService } from './infrastructure/pdf-link-parser.service';
import { Resume } from './resume.entity';

export const CommandHandlers = [ParseResumeHandler];
export const QueryHandlers = [CompareResumeHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Resume])],
  controllers: [ResumeController],
  providers: [
    ResumeAnalysisService,
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
})
export class ResumeModule {}
