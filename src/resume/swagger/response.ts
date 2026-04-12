import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { parsedResumeSchema } from './schemas';
import { ResumeMatchResponseDto } from '../presentation/dto/compare-resume.dto';
import { SaveResumeResponseDto } from '../presentation/dto/save-resume-response.dto';

export const ResumeResponses = {
  AnalyzeSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume analyzed successfully',
    schema: parsedResumeSchema,
  }),

  AnalyzeBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file (size or type)',
  }),

  CompareSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume compared with vacancy successfully',
    type: ResumeMatchResponseDto,
  }),

  CompareBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data or vacancy not found',
  }),

  SaveSuccess: ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Resume saved successfully',
    type: SaveResumeResponseDto,
  }),

  SaveBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid resume data or referenced vacancy/analysis not found',
  }),

  GetSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume retrieved successfully',
    type: SaveResumeResponseDto,
  }),

  GetNotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Resume not found',
  }),
};
