import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AnalyzeResumeForVacancyCommand } from './analyze-resume.command';
import { ResumeOptimizationService } from '../../resume-optimization.service';
import { GetVacancyByIdQuery } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.query';
import type { GetVacancyByIdQueryResponse } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.handler';
import { AIOptimizeResumeQuery } from '@/openai/queries/ai-optimize-resume/ai-optimize-resume.query';
import type { AIOptimizeResumeQueryResponse } from '@/openai/queries/ai-optimize-resume/ai-optimize-resume.handler';
import { ResolveSourceResumeQuery } from '@/resume/application/queries/resolve-source-resume/resolve-source-resume.query';
import type { ResolveSourceResumeQueryResponse } from '@/resume/application/queries/resolve-source-resume/resolve-source-resume.handler';
import { GetUserSettingsQuery } from '@/settings/queries/get-user-settings/get-user-settings.query';
import type { GetUserSettingsQueryResponse } from '@/settings/queries/get-user-settings/get-user-settings.handler';
import { SendNotificationCommand } from '@/notifications/application/commands/send-notification/send-notification.command';
import { ResumeAnalysis } from '@/resume-optimization/resume-analysis.entity';
import type { ResumeOptimizationOptions } from '@/openai/constants/prompts/resume-optimization.prompt';

@CommandHandler(AnalyzeResumeForVacancyCommand)
@Injectable()
export class AnalyzeResumeForVacancyHandler
  implements ICommandHandler<AnalyzeResumeForVacancyCommand>
{
  private readonly logger = new Logger(AnalyzeResumeForVacancyHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly resumeOptimizationService: ResumeOptimizationService,
  ) {}

  async execute(
    command: AnalyzeResumeForVacancyCommand,
  ): Promise<ResumeAnalysis> {
    const { userId, vacancyId } = command;

    const parsedResume = await this.queryBus.execute<
      ResolveSourceResumeQuery,
      ResolveSourceResumeQueryResponse
    >(new ResolveSourceResumeQuery(userId, vacancyId));

    const vacancy = await this.queryBus.execute<
      GetVacancyByIdQuery,
      GetVacancyByIdQueryResponse
    >(new GetVacancyByIdQuery(vacancyId, userId));

    if (!vacancy?.parsedData) {
      throw new NotFoundException(
        `Vacancy with ID ${vacancyId} not found or has no parsed data`,
      );
    }

    const settings = await this.queryBus.execute<
      GetUserSettingsQuery,
      GetUserSettingsQueryResponse
    >(new GetUserSettingsQuery(userId));

    const optimizationOptions: ResumeOptimizationOptions = {
      mode: settings.aiSettings?.resumeOptimization ?? 'aggressive',
      writingStyle:
        settings.aiSettings?.writingStyle ?? 'professional-balanced',
      contentLang: settings.aiSettings?.generatedContentLang ?? 'english',
    };

    const analysis = await this.resumeOptimizationService.upsertAnalysis(
      userId,
      vacancyId,
      parsedResume.id,
    );

    try {
      const result = await this.queryBus.execute<
        AIOptimizeResumeQuery,
        AIOptimizeResumeQueryResponse
      >(
        new AIOptimizeResumeQuery(
          parsedResume,
          vacancy.parsedData,
          optimizationOptions,
        ),
      );

      const completed = await this.resumeOptimizationService.completeAnalysis(
        analysis.id,
        {
          analysis: result.analysis,
          suggestedContent: result.suggestedContent,
          sectionChanges: result.sectionChanges,
        },
      );

      const vacancyTitle = vacancy.parsedData.title ?? 'Unknown';

      await this.commandBus.execute(
        new SendNotificationCommand(
          {
            type: 'resume_analysis_completed',
            message: `Resume analysis for "${vacancyTitle}" is ready`,
            data: { analysisId: completed.id, vacancyId },
          },
          [userId],
        ),
      );

      return completed;
    } catch (error) {
      await this.resumeOptimizationService.failAnalysis(
        analysis.id,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }
}

export type AnalyzeResumeForVacancyCommandResponse = ResumeAnalysis;
