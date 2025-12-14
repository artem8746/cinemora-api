import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ParseResumeCommand } from '../application/commands/parse-resume/parse-resume.command';
import { ParseResumeCommandResponse } from '../application/commands/parse-resume/parse-resume.handler';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { ResumeRequests } from '../swagger/request';
import { ResumeResponses } from '../swagger/response';
import { FastifyFileInterceptor } from '@/files/presentation/interceptors/fastify-file.interceptor';
import { FileValidationPipe } from '@/files/presentation/pipes/file-validation.pipe';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { UploadedFile as UploadedFileType } from '@/files/presentation/types/file.interface';
import { ParsedResume } from './types/resume';
@ApiTags('resume')
@Controller('resume')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
