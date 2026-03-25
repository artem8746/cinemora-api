import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ResumeAnalysisStatus } from '../types/resume-analysis';

export class UpdateResumeAnalysisStatusDto {
  @ApiProperty({
    enum: ResumeAnalysisStatus,
    description: 'New analysis status',
  })
  @IsEnum(ResumeAnalysisStatus)
  status: ResumeAnalysisStatus;
}
