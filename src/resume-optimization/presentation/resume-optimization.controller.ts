import {
  Controller,
  Get,
  Post,
  Patch,
  UseGuards,
  Param,
  ParseUUIDPipe,
  Body,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { AnalyzeResumeForVacancyCommand } from '../application/commands/analyze-resume/analyze-resume.command';
import type { AnalyzeResumeForVacancyCommandResponse } from '../application/commands/analyze-resume/analyze-resume.handler';
import { GetResumeAnalysisQuery } from '../application/queries/get-resume-analysis/get-resume-analysis.query';
import type { GetResumeAnalysisQueryResponse } from '../application/queries/get-resume-analysis/get-resume-analysis.handler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { ResumeAnalysisResponseDto } from './dto/resume-analysis.dto';
import { ResumeOptimizationResponses } from '../swagger/response';
import { UpdateResumeAnalysisStatusDto } from '@/resume-optimization/presentation/dto/update-resume-analysis-status.dto';
import { UpdateResumeAnalysisStatusCommand } from '@/resume-optimization/application/commands/update-resume-analysis-status/update-resume-analysis-status.command';
import type { UpdateResumeAnalysisStatusCommandResponse } from '@/resume-optimization/application/commands/update-resume-analysis-status/update-resume-analysis-status.handler';

@ApiTags('resume-optimization')
@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeOptimizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('analyze/:vacancyId')
  @ApiOperation({
    summary: 'Analyze and optimize resume for a specific vacancy',
    description:
      'Generates AI-powered ATS optimization suggestions for your resume tailored to a specific vacancy. Creates per-section change recommendations and a fully optimized resume draft.',
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'ID of the vacancy to optimize for',
    type: String,
  })
  @ResumeOptimizationResponses.AnalyzeSuccess
  @ResumeOptimizationResponses.AnalyzeBadRequest
  async analyzeForVacancy(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ResumeAnalysisResponseDto> {
    const result: AnalyzeResumeForVacancyCommandResponse =
      await this.commandBus.execute<
        AnalyzeResumeForVacancyCommand,
        AnalyzeResumeForVacancyCommandResponse
      >(new AnalyzeResumeForVacancyCommand(userId, vacancyId));

    return result;
  }

  @Get('analysis/:vacancyId')
  @ApiOperation({
    summary: 'Get existing resume analysis for a vacancy',
    description:
      'Retrieves a previously created resume analysis for the specified vacancy.',
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'ID of the vacancy',
    type: String,
  })
  @ResumeOptimizationResponses.GetAnalysisSuccess
  @ResumeOptimizationResponses.GetAnalysisNotFound
  async getAnalysis(
    @Param('vacancyId', ParseUUIDPipe) vacancyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ResumeAnalysisResponseDto | null> {
    const result: GetResumeAnalysisQueryResponse = await this.queryBus.execute<
      GetResumeAnalysisQuery,
      GetResumeAnalysisQueryResponse
    >(new GetResumeAnalysisQuery(userId, vacancyId));

    return result;
  }

  @Patch('analysis/:analysisId/status')
  @ApiOperation({
    summary: 'Update resume analysis status',
    description:
      'Updates the status field of an existing resume analysis (e.g. processing/completed/failed).',
  })
  @ApiParam({
    name: 'analysisId',
    description: 'ID of the analysis',
    type: String,
  })
  @ResumeOptimizationResponses.UpdateStatusSuccess
  @ResumeOptimizationResponses.UpdateStatusNotFound
  async updateAnalysisStatus(
    @Param('analysisId', ParseUUIDPipe) analysisId: string,
    @CurrentUserId() userId: string,
    @Body() body: UpdateResumeAnalysisStatusDto,
  ): Promise<ResumeAnalysisResponseDto> {
    const result: UpdateResumeAnalysisStatusCommandResponse =
      await this.commandBus.execute<
        UpdateResumeAnalysisStatusCommand,
        UpdateResumeAnalysisStatusCommandResponse
      >(new UpdateResumeAnalysisStatusCommand(userId, analysisId, body.status));

    return result;
  }
}
