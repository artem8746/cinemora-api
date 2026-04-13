import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplyResumeAnalysisCommand } from './apply-resume-analysis.command';
import { ResumeOptimizationService } from '@/resume-optimization/application/resume-optimization.service';
import { ResumeAnalysis } from '@/resume-optimization/resume-analysis.entity';

@CommandHandler(ApplyResumeAnalysisCommand)
@Injectable()
export class ApplyResumeAnalysisHandler implements ICommandHandler<ApplyResumeAnalysisCommand> {
  constructor(
    private readonly resumeOptimizationService: ResumeOptimizationService,
  ) {}

  async execute(command: ApplyResumeAnalysisCommand): Promise<ResumeAnalysis> {
    const updated =
      await this.resumeOptimizationService.applyAnalysisForUserAndAnalysisId(
        command.userId,
        command.analysisId,
        command.appliedAtsScore,
        command.appliedMatchScore,
      );

    if (!updated) {
      throw new NotFoundException('Resume analysis not found');
    }

    return updated;
  }
}

export type ApplyResumeAnalysisCommandResponse = ResumeAnalysis;
