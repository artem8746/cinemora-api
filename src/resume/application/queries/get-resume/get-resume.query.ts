import { Query } from '@nestjs/cqrs';
import { Resume } from '@/resume/resume.entity';

export class GetResumeQuery extends Query<Resume | null> {
  constructor(
    public readonly userId: string,
    public readonly resumeId?: string,
  ) {
    super();
  }
}
