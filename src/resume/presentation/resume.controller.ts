import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiConsumes, ApiTags, ApiParam } from '@nestjs/swagger';
import { ParseResumeCommand } from '../application/commands/parse-resume/parse-resume.command';
import { ParseResumeCommandResponse } from '../application/commands/parse-resume/parse-resume.handler';
import { CompareResumeQuery } from '../application/queries/compare-resume/compare-resume.query';
import { CompareResumeQueryResponse } from '../application/queries/compare-resume/compare-resume.handler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ResumeRequests } from '../swagger/request';
import { ResumeResponses } from '../swagger/response';
import { FastifyFileInterceptor } from '@/files/presentation/interceptors/fastify-file.interceptor';
import { FileValidationPipe } from '@/files/presentation/pipes/file-validation.pipe';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { UploadedFile as UploadedFileType } from '@/files/presentation/types/file.interface';
import { ParsedResume } from './types/resume';
import { ResumeMatchResponseDto } from './dto/compare-resume.dto';

@ApiTags('resume')
@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
}
