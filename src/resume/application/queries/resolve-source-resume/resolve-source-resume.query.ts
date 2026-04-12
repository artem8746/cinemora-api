import { Query } from '@nestjs/cqrs';
import type { ParsedResume } from '@/resume/presentation/types/resume';

export class ResolveSourceResumeQuery extends Query<ParsedResume> {
  constructor(
    public readonly userId: string,
    public readonly vacancyId: string,
  ) {
    super();
  }
}
