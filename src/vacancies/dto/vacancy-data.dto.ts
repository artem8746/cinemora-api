import { ApiProperty } from '@nestjs/swagger';

export class VacancyDataDto {
  @ApiProperty({ example: 'Senior Backend Developer' })
  title!: string;

  @ApiProperty({ example: 'Tech Corp Inc.' })
  company!: string;

  @ApiProperty({ example: 'New York, USA' })
  location!: string;

  @ApiProperty({ example: '$100000 - $150000', nullable: true })
  salary!: string | null;

  @ApiProperty({
    example: 'Full-time',
    nullable: true,
    description:
      'Employment type: Full-time, Part-time, Contract, Internship, Freelance',
  })
  employmentType!: string | null;

  @ApiProperty({
    example: 'Remote',
    nullable: true,
    description: 'Work type: Remote, On-site, Hybrid',
  })
  workType!: string | null;

  @ApiProperty({
    example: 'Long-term (1+ year)',
    nullable: true,
    description: 'Contract/project duration',
  })
  duration!: string | null;

  @ApiProperty({
    example: 'Senior',
    nullable: true,
    description: 'Experience level: Junior, Middle, Senior, Lead',
  })
  experienceLevel!: string | null;

  @ApiProperty({ example: 'Vacancy description...' })
  description!: string;

  @ApiProperty({ example: ['API Development', 'Performance Optimization'] })
  responsibilities!: string[];

  @ApiProperty({
    example: ['5+ years of experience', 'TypeScript knowledge'],
    description: 'Mandatory requirements',
  })
  requirements!: string[];

  @ApiProperty({
    example: ['Experience with microservices', 'Knowledge of Docker'],
    description: 'Preferred/optional requirements (nice to have)',
  })
  niceToHave!: string[];

  @ApiProperty({ example: ['TypeScript', 'NestJS', 'PostgreSQL'] })
  skills!: string[];

  @ApiProperty({
    example: ['Health insurance', 'Remote work', 'Stock options'],
    description: 'Company benefits, perks, bonuses',
  })
  benefits!: string[];
}

export class ParseVacancyResponseDto {
  @ApiProperty({ example: true })
  isVacancy!: boolean;

  @ApiProperty({ type: VacancyDataDto, nullable: true })
  data!: VacancyDataDto | null;
}
