import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { ResolveSourceResumeQuery } from './resolve-source-resume.query';
import { ResumeService } from '@/resume/application/resume.service';
import type { ParsedResume } from '@/resume/presentation/types/resume';

@QueryHandler(ResolveSourceResumeQuery)
@Injectable()
export class ResolveSourceResumeHandler
  implements IQueryHandler<ResolveSourceResumeQuery>
{
  constructor(private readonly resumeService: ResumeService) {}

  async execute(query: ResolveSourceResumeQuery): Promise<ParsedResume> {
    return await this.resumeService.resolveSourceResume(
      query.userId,
      query.vacancyId,
    );
  }
}

export type ResolveSourceResumeQueryResponse = ParsedResume;
