import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { IsObject, IsOptional, IsUUID } from 'class-validator';
import { parsedResumeDataSchema } from '@/resume/swagger/schemas';
import { SaveResumeInput } from '../types/resume';

export class SaveResumeDto {
  private static readonly resumeApiPropertyOptions =
    parsedResumeDataSchema as unknown as ApiPropertyOptions;

  @ApiProperty({
    description:
      'Resume content (title, personalDetails, content, customization). When saving from analysis, send suggestedContent as-is; id and userId are optional and ignored for vacancy-specific save.',
    ...SaveResumeDto.resumeApiPropertyOptions,
  })
  @IsObject()
  resume: SaveResumeInput;

  @ApiPropertyOptional({
    description: 'Vacancy ID to save as vacancy-specific optimized resume',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  vacancyId?: string;

  @ApiPropertyOptional({
    description:
      'Analysis ID that generated this resume (links saved resume to the analysis)',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  analysisId?: string;
}
