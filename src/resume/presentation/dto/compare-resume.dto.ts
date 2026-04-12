import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { parsedResumeSchema } from '@/resume/swagger/schemas';
import { ParsedResume } from '../types/resume';

export enum SkillMatchStatus {
  MATCH = 'match',
  PARTIAL = 'partial',
  MISSING = 'missing',
}

export class KeySkillMatchDto {
  @ApiProperty({
    example: 'React',
    description: 'Skill name',
  })
  skill!: string;

  @ApiProperty({
    enum: SkillMatchStatus,
    example: SkillMatchStatus.MATCH,
    description: 'Match status: match, partial, or missing',
  })
  status!: SkillMatchStatus;

  @ApiProperty({
    example: 'You have it',
    description: 'Message describing the match status',
  })
  message!: string;
}

export class AiInsightsDto {
  @ApiProperty({
    example: 85,
    description: 'ATS (Applicant Tracking System) score',
    minimum: 0,
    maximum: 100,
  })
  atsScore!: number;

  @ApiProperty({
    example: 75,
    description: 'Keyword match percentage',
    minimum: 0,
    maximum: 100,
  })
  keywordMatch!: number;

  @ApiProperty({
    example: 80,
    description: 'Experience match percentage',
    minimum: 0,
    maximum: 100,
  })
  experienceMatch!: number;
}

export class CompareResumeDto {
  private static readonly resumeApiPropertyOptions =
    parsedResumeSchema as unknown as ApiPropertyOptions;

  @ApiProperty({
    description: 'Parsed resume data',
    ...CompareResumeDto.resumeApiPropertyOptions,
  })
  @IsObject()
  resume!: ParsedResume;
}

export class ResumeMatchResponseDto {
  @ApiProperty({
    type: [KeySkillMatchDto],
    description: 'Key skills match analysis',
    example: [
      {
        skill: 'React',
        status: 'match',
        message: 'You have it',
      },
      {
        skill: 'TypeScript',
        status: 'match',
        message: 'You have it',
      },
      {
        skill: 'System Design',
        status: 'partial',
        message: 'Partial match',
      },
      {
        skill: 'GraphQL',
        status: 'missing',
        message: 'Missing - add to resume!',
      },
    ],
  })
  keySkillsMatch!: KeySkillMatchDto[];

  @ApiProperty({
    example: 78,
    description: 'Overall match score percentage',
    minimum: 0,
    maximum: 100,
  })
  matchScore!: number;

  @ApiProperty({
    type: [String],
    description: 'List of strengths identified',
    example: [
      'Your React experience aligns well',
      'Leadership background fits',
    ],
  })
  strengths!: string[];

  @ApiProperty({
    type: [String],
    description: 'List of recommendations to improve',
    example: ['Add GraphQL projects', 'Highlight system design examples'],
  })
  toImprove!: string[];

  @ApiProperty({
    type: AiInsightsDto,
    description: 'Additional AI insights and metrics',
  })
  aiInsights!: AiInsightsDto;
}
