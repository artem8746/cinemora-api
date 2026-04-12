import { Injectable, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetResumeQuery } from './get-resume.query';
import { ResumeService } from '@/resume/application/resume.service';
import { Resume } from '@/resume/resume.entity';

@QueryHandler(GetResumeQuery)
@Injectable()
export class GetResumeHandler implements IQueryHandler<GetResumeQuery> {
  constructor(private readonly resumeService: ResumeService) {}

  async execute(query: GetResumeQuery): Promise<Resume> {
    const resume = await this.resumeService.getResume(
      query.userId,
      query.resumeId,
    );

    if (!resume) {
      throw new NotFoundException(
        query.resumeId
          ? `Resume with ID ${query.resumeId} not found`
          : 'No main resume found. Please upload and parse your resume first.',
      );
    }

    return resume;
  }
}

export type GetResumeQueryResponse = Resume;
