import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import {
  keySkillsMatchSchema,
  sectionChangeSummarySchema,
  suggestedContentPatchSchema,
} from '../../swagger/schemas';
import type {
  KeySkillMatch,
  SectionChangeSummary,
  SuggestedContentPatch,
} from '../types/resume-analysis';
import { ResumeAnalysisStatus } from '../types/resume-analysis';

export class ResumeAnalysisResponseDto {
  private static readonly keySkillsMatchApiPropertyOptions =
    keySkillsMatchSchema as unknown as ApiPropertyOptions;

  private static readonly suggestedContentApiPropertyOptions =
    suggestedContentPatchSchema as unknown as ApiPropertyOptions;

  @ApiProperty({ description: 'Analysis ID', format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'User ID', format: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Vacancy ID', format: 'uuid' })
  vacancyId: string;

  @ApiPropertyOptional({
    description: 'Source resume ID',
    format: 'uuid',
    type: String,
  })
  sourceResumeId: string | null;

  @ApiProperty({
    enum: ResumeAnalysisStatus,
    description: 'Analysis status',
  })
  status: ResumeAnalysisStatus;

  @ApiPropertyOptional({
    description: 'Initial ATS score before optimization (0-100)',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  initialAtsScore: number | null;

  @ApiPropertyOptional({
    description: 'Initial match score before optimization (0-100)',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  initialMatchScore: number | null;

  @ApiProperty({
    description: 'Whether this analysis was used to apply to vacancy',
  })
  isApplied: boolean;

  @ApiPropertyOptional({
    description: 'ATS score at the moment of applying (0-100)',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  appliedAtsScore: number | null;

  @ApiPropertyOptional({
    description: 'Match score at the moment of applying (0-100)',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  appliedMatchScore: number | null;

  @ApiPropertyOptional({
    description: 'Key skills match analysis',
    ...ResumeAnalysisResponseDto.keySkillsMatchApiPropertyOptions,
  })
  keySkillsMatch: KeySkillMatch[] | null;

  @ApiPropertyOptional({ description: 'Strengths', type: [String] })
  strengths: string[] | null;

  @ApiPropertyOptional({
    description: 'Improvement suggestions',
    type: [String],
  })
  improvements: string[] | null;

  @ApiPropertyOptional({
    description: 'Suggested optimized resume content',
    ...ResumeAnalysisResponseDto.suggestedContentApiPropertyOptions,
  })
  suggestedContent: SuggestedContentPatch | null;

  @ApiPropertyOptional({
    description: 'Per-section change summaries',
    type: 'object',
    additionalProperties: sectionChangeSummarySchema as never,
  })
  sectionChanges: Record<string, SectionChangeSummary> | null;

  @ApiPropertyOptional({ description: 'Error message if analysis failed' })
  errorMessage: string | null;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt: Date;
}
