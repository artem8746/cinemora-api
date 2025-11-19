import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { AuthenthicatedRequest } from '@/generic/interface/request';
import { UploadAvatarCommand } from '../application/commands/upload-avatar/upload-avatar.command';
import { UploadResumeCommand } from '../application/commands/upload-resume/upload-resume.command';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UploadAvatarCommandResponse } from '../application/commands/upload-avatar/upload-avatar.handler';
import { UploadResumeCommandResponse } from '../application/commands/upload-resume/upload-resume.handler';
import { FileValidationPipe } from './pipes/file-validation.pipe';
import { FileResponses } from '../swagger/response';
import { UploadedFile as UploadedFileType } from './types/file.interface';
import { FastifyFileInterceptor } from './interceptors/fastify-file.interceptor';
import { FileRequests } from '../swagger/request';

@Controller('files')
export class FilesController {
  constructor(private readonly commandBus: CommandBus) {}

  // TODO: Add auth guard
  @Post('avatar')
  @UseInterceptors(new FastifyFileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @FileRequests.FileUploadRequest
  @FileResponses.UploadAvatarSuccess
  @FileResponses.UploadAvatarBadRequest
  async uploadAvatar(
    @Req() req: AuthenthicatedRequest,
    @UploadedFile(new FileValidationPipe('avatar')) file: UploadedFileType,
  ): Promise<UploadResponseDto> {
    // TODO: Replace with actual user ID
    const userId = 'bc136e79-72d6-4f07-a403-19f2a163331b';
    const url = await this.commandBus.execute<
      UploadAvatarCommand,
      UploadAvatarCommandResponse
    >(new UploadAvatarCommand(userId, file));

    return new UploadResponseDto(url);
  }

  // TODO: Add auth guard
  @Post('resume')
  @UseInterceptors(new FastifyFileInterceptor('file'))
  @ApiOperation({ summary: 'Upload user resume' })
  @ApiConsumes('multipart/form-data')
  @FileRequests.FileUploadRequest
  @FileResponses.UploadResumeSuccess
  @FileResponses.UploadResumeBadRequest
  async uploadResume(
    @Req() req: AuthenthicatedRequest,
    @UploadedFile(new FileValidationPipe('resume')) file: UploadedFileType,
  ): Promise<UploadResponseDto> {
    // TODO: Replace with actual user ID
    const userId = 'bc136e79-72d6-4f07-a403-19f2a163331b';
    const url = await this.commandBus.execute<
      UploadResumeCommand,
      UploadResumeCommandResponse
    >(new UploadResumeCommand(userId, file));

    return new UploadResponseDto(url);
  }
}
