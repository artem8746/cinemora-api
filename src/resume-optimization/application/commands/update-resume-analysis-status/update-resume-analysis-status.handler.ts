import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateResumeAnalysisStatusCommand } from './update-resume-analysis-status.command';
import { ResumeOptimizationService } from '@/resume-optimization/application/resume-optimization.service';
import { ResumeAnalysis } from '@/resume-optimization/resume-analysis.entity';

@CommandHandler(UpdateResumeAnalysisStatusCommand)
@Injectable()
export class UpdateResumeAnalysisStatusHandler implements ICommandHandler<UpdateResumeAnalysisStatusCommand> {
  constructor(
    private readonly resumeOptimizationService: ResumeOptimizationService,
  ) {}

  async execute(
    command: UpdateResumeAnalysisStatusCommand,
  ): Promise<ResumeAnalysis> {
    const updated =
      await this.resumeOptimizationService.updateStatusForUserAndAnalysisId(
        command.userId,
        command.analysisId,
        command.status,
      );

    if (!updated) {
      throw new NotFoundException('Resume analysis not found');
    }

    return updated;
  }
}

export type UpdateResumeAnalysisStatusCommandResponse = ResumeAnalysis;
