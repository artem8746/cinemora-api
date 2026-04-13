import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeOptimizationController } from './presentation/resume-optimization.controller';
import { ResumeOptimizationService } from './application/resume-optimization.service';
import { AnalyzeResumeForVacancyHandler } from './application/commands/analyze-resume/analyze-resume.handler';
import { ApplyResumeAnalysisHandler } from './application/commands/apply-resume-analysis/apply-resume-analysis.handler';
import { GetResumeAnalysisHandler } from './application/queries/get-resume-analysis/get-resume-analysis.handler';
import { ResumeAnalysis } from './resume-analysis.entity';

const CommandHandlers = [
  AnalyzeResumeForVacancyHandler,
  ApplyResumeAnalysisHandler,
];
const QueryHandlers = [GetResumeAnalysisHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ResumeAnalysis])],
  controllers: [ResumeOptimizationController],
  providers: [ResumeOptimizationService, ...CommandHandlers, ...QueryHandlers],
})
export class ResumeOptimizationModule {}
