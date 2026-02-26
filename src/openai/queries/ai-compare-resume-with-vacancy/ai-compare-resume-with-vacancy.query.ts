import { Query } from '@nestjs/cqrs';
import type { ParsedResume } from '@/resume/presentation/types/resume';
import type { ParsedVacancyData } from '../../types/parsed-vacancy.type';
import type { ResumeMatchResponseDto } from '@/resume/presentation/dto/compare-resume.dto';

export class AICompareResumeWithVacancyQuery extends Query<ResumeMatchResponseDto> {
  constructor(
    public readonly resume: ParsedResume,
    public readonly vacancy: ParsedVacancyData,
  ) {
    super();
  }
}
