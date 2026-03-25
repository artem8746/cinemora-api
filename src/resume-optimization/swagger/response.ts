import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ResumeAnalysisResponseDto } from '../presentation/dto/resume-analysis.dto';

export const ResumeOptimizationResponses = {
  AnalyzeSuccess: ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Resume analysis created and optimization completed',
    type: ResumeAnalysisResponseDto,
  }),

  AnalyzeBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No resume found for user or vacancy not found',
  }),

  GetAnalysisSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume analysis retrieved successfully',
    type: ResumeAnalysisResponseDto,
  }),

  GetAnalysisNotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No analysis found for this vacancy',
  }),

  UpdateStatusSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume analysis status updated successfully',
    type: ResumeAnalysisResponseDto,
  }),

  UpdateStatusNotFound: ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No analysis found',
  }),
};
