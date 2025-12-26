import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class VacancyDataDto {
  @ApiProperty({ example: 'Senior Backend Developer', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  title?: string | null;

  @ApiProperty({ example: 'Tech Corp Inc.', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  company?: string | null;

  @ApiProperty({ example: 'New York, USA', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  location?: string | null;

  @ApiProperty({ example: '$100000 - $150000', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  salary?: string | null;

  @ApiProperty({
    example: 'Full-time',
    nullable: true,
    description:
      'Employment type: Full-time, Part-time, Contract, Internship, Freelance',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  employmentType?: string | null;

  @ApiProperty({
    example: 'Remote',
    nullable: true,
    description: 'Work type: Remote, On-site, Hybrid',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  workType?: string | null;

  @ApiProperty({
    example: 'Long-term (1+ year)',
    nullable: true,
    description: 'Contract/project duration',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  duration?: string | null;

  @ApiProperty({
    example: 'Senior',
    nullable: true,
    description: 'Experience level: Junior, Middle, Senior, Lead',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  experienceLevel?: string | null;

  @ApiProperty({ example: 'Vacancy description...', nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  @IsString()
  description?: string | null;

  @ApiProperty({
    example: ['API Development', 'Performance Optimization'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiProperty({
    example: ['5+ years of experience', 'TypeScript knowledge'],
    description: 'Mandatory requirements',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @ApiProperty({
    example: ['Experience with microservices', 'Knowledge of Docker'],
    description: 'Preferred/optional requirements (nice to have)',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  niceToHave?: string[];

  @ApiProperty({
    example: ['TypeScript', 'NestJS', 'PostgreSQL'],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({
    example: ['Health insurance', 'Remote work', 'Stock options'],
    description: 'Company benefits, perks, bonuses',
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];
}

export class ParseVacancyResponseDto {
  @ApiProperty({ example: true })
  isVacancy!: boolean;

  @ApiProperty({ type: VacancyDataDto, nullable: true })
  data!: VacancyDataDto | null;
}
