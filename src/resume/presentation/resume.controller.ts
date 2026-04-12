import {
  Body,
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiOperation,
  ApiConsumes,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ParseResumeCommand } from '../application/commands/parse-resume/parse-resume.command';
import { ParseResumeCommandResponse } from '../application/commands/parse-resume/parse-resume.handler';
import { CompareResumeQuery } from '../application/queries/compare-resume/compare-resume.query';
import { CompareResumeQueryResponse } from '../application/queries/compare-resume/compare-resume.handler';
import { SaveResumeCommand } from '../application/commands/save-resume/save-resume.command';
import type { SaveResumeCommandResponse } from '../application/commands/save-resume/save-resume.handler';
import { GetResumeQuery } from '../application/queries/get-resume/get-resume.query';
import type { GetResumeQueryResponse } from '../application/queries/get-resume/get-resume.handler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ResumeRequests } from '../swagger/request';
import { ResumeResponses } from '../swagger/response';
import { FastifyFileInterceptor } from '@/files/presentation/interceptors/fastify-file.interceptor';
import { FileValidationPipe } from '@/files/presentation/pipes/file-validation.pipe';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { UploadedFile as UploadedFileType } from '@/files/presentation/types/file.interface';
import { ParsedResume } from './types/resume';
import { ResumeMatchResponseDto } from './dto/compare-resume.dto';
import { SaveResumeDto } from './dto/save-resume.dto';
import { Resume } from '../resume.entity';

@ApiTags('resume')
@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get resume',
    description:
      'Returns the main resume for the user. Optionally pass resumeId query param to fetch a specific resume by ID.',
  })
  @ApiQuery({
    name: 'resumeId',
    required: false,
    description: 'Resume ID. If omitted, returns the main resume.',
    type: String,
  })
  @ResumeResponses.GetSuccess
  @ResumeResponses.GetNotFound
  async getResume(
    @Query('resumeId') resumeId: string | undefined,
    @CurrentUserId() userId: string,
  ): Promise<Resume> {
    return await this.queryBus.execute<GetResumeQuery, GetResumeQueryResponse>(
      new GetResumeQuery(userId, resumeId),
    );
  }

  @Post('parse')
  @UseInterceptors(new FastifyFileInterceptor('file'))
  @ApiOperation({ summary: 'Analyze resume PDF and extract content' })
  @ApiConsumes('multipart/form-data')
  @ResumeRequests.FileUploadRequest
  @ResumeResponses.AnalyzeSuccess
  @ResumeResponses.AnalyzeBadRequest
  async analyze(
    @UploadedFile(new FileValidationPipe('resume')) file: UploadedFileType,
    @CurrentUserId() userId: string,
  ): Promise<ParsedResume> {
    return await this.commandBus.execute<
      ParseResumeCommand,
      ParseResumeCommandResponse
    >(new ParseResumeCommand(userId, file));
  }

  // TODO: REPLACE FOR RESUME ANALYSIS CONTROLLER
  @Post('compare/:vacancyId')
  @ApiOperation({
    summary: 'Compare resume with vacancy using AI analysis',
    description:
      'Analyzes how well your uploaded resume matches a specific vacancy, providing ATS scores, skill matches, strengths, and improvement recommendations. Uses your most recent uploaded resume.',
  })
  @ApiParam({
    name: 'vacancyId',
    description: 'ID of the vacancy to compare against',
    type: String,
  })
  @ResumeResponses.CompareSuccess
  @ResumeResponses.CompareBadRequest
  async compareResume(
    @Param('vacancyId') vacancyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ResumeMatchResponseDto> {
    return await this.queryBus.execute<
      CompareResumeQuery,
      CompareResumeQueryResponse
    >(new CompareResumeQuery(vacancyId, userId));
  }

  @Post('save')
  @ApiOperation({
    summary: 'Save resume (main or vacancy-specific)',
    description:
      'Saves a resume. If vacancyId is provided, saves as a vacancy-specific optimized resume. Otherwise saves as the main resume.',
  })
  @ResumeRequests.SaveResumeRequest
  @ResumeResponses.SaveSuccess
  @ResumeResponses.SaveBadRequest
  async saveResume(
    @Body() dto: SaveResumeDto,
    @CurrentUserId() userId: string,
  ): Promise<Resume> {
    return await this.commandBus.execute<
      SaveResumeCommand,
      SaveResumeCommandResponse
    >(new SaveResumeCommand(userId, dto.resume, dto.vacancyId, dto.analysisId));
  }
}
