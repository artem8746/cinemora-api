import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeOptimizationController } from './presentation/resume-optimization.controller';
import { ResumeOptimizationService } from './application/resume-optimization.service';
import { AnalyzeResumeForVacancyHandler } from './application/commands/analyze-resume/analyze-resume.handler';
import { UpdateResumeAnalysisStatusHandler } from './application/commands/update-resume-analysis-status/update-resume-analysis-status.handler';
import { GetResumeAnalysisHandler } from './application/queries/get-resume-analysis/get-resume-analysis.handler';
import { ResumeAnalysis } from './resume-analysis.entity';

const CommandHandlers = [
  AnalyzeResumeForVacancyHandler,
  UpdateResumeAnalysisStatusHandler,
];
const QueryHandlers = [GetResumeAnalysisHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ResumeAnalysis])],
  controllers: [ResumeOptimizationController],
  providers: [ResumeOptimizationService, ...CommandHandlers, ...QueryHandlers],
})
export class ResumeOptimizationModule {}
