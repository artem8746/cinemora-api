import { Query } from '@nestjs/cqrs';
import type { ResumeMatchResponseDto } from '@/resume/presentation/dto/compare-resume.dto';

export class CompareResumeQuery extends Query<ResumeMatchResponseDto> {
  constructor(
    public readonly vacancyId: string,
    public readonly userId: string,
  ) {
    super();
  }
}
