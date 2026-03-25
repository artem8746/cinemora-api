import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { parsedResumeDataSchema } from '@/resume/swagger/schemas';
import { ParsedResume } from '../types/resume';

const parsedDataApiPropertyOptions = {
  ...parsedResumeDataSchema,
} as unknown as ApiPropertyOptions;

export class SaveResumeResponseDto {
  @ApiProperty({ description: 'Resume ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Owner user ID', format: 'uuid' })
  userId: string;

  @ApiPropertyOptional({
    description: 'Linked vacancy ID (null for the main resume)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  vacancyId: string | null;

  @ApiPropertyOptional({
    description: 'Linked analysis ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  analysisId: string | null;

  @ApiProperty({
    description: 'Resume title',
    example: 'John Doe - Software Engineer',
  })
  title: string;

  @ApiProperty({
    description: 'Full name extracted from resume',
    example: 'John Doe',
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Job title extracted from resume',
    example: 'Software Engineer',
  })
  jobTitle?: string | null;

  @ApiProperty({
    description:
      'Resume content (personalDetails, content sections, customization)',
    ...parsedDataApiPropertyOptions,
  })
  parsedData: Omit<ParsedResume, 'id' | 'userId' | 'title'>;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
