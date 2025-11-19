import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { UploadResponseDto } from '../presentation/dto/upload-response.dto';

export const FileResponses = {
  UploadAvatarSuccess: ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Avatar uploaded successfully',
    type: UploadResponseDto,
  }),

  UploadAvatarBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file (size or type)',
  }),

  UploadResumeSuccess: ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Resume uploaded successfully',
    type: UploadResponseDto,
  }),

  UploadResumeBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file (size or type)',
  }),
};
