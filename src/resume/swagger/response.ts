import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AnalyzeResponseDto } from '../presentation/dto/analyze-response.dto';

export const ResumeResponses = {
  AnalyzeSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume analyzed successfully',
    type: AnalyzeResponseDto,
  }),

  AnalyzeBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file (size or type)',
  }),
};
