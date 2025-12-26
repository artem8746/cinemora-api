import { IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CompareResumeQuery } from './compare-resume.query';
import { GetVacancyByIdQuery } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.query';
import { GetVacancyByIdQueryResponse } from '@/vacancies/queries/get-vacancy-by-id/get-vacancy-by-id.handler';
import { AICompareResumeWithVacancyQuery } from '@/openai/queries/ai-compare-resume-with-vacancy/ai-compare-resume-with-vacancy.query';
import { AICompareResumeWithVacancyQueryResponse } from '@/openai/queries/ai-compare-resume-with-vacancy/ai-compare-resume-with-vacancy.handler';
import { ResumeService } from '../../resume.service';
import type { ResumeMatchResponseDto } from '@/resume/presentation/dto/compare-resume.dto';

@QueryHandler(CompareResumeQuery)
@Injectable()
export class CompareResumeHandler implements IQueryHandler<CompareResumeQuery> {
  private readonly logger = new Logger(CompareResumeHandler.name);

  constructor(
    private readonly queryBus: QueryBus,
    private readonly resumeService: ResumeService,
  ) {}

  async execute(query: CompareResumeQuery): Promise<ResumeMatchResponseDto> {
    const { vacancyId, userId } = query;

    const resume = await this.resumeService.getUserResumeAsParsedResume(userId);
    if (!resume) {
      throw new NotFoundException(
        'Resume not found. Please upload and parse your resume first.',
      );
    }

    const vacancy = await this.queryBus.execute<
      GetVacancyByIdQuery,
      GetVacancyByIdQueryResponse
    >(new GetVacancyByIdQuery(vacancyId, userId));

    if (!vacancy || !vacancy.parsedData) {
      throw new NotFoundException(
        `Vacancy with ID ${vacancyId} not found or has no parsed data`,
      );
    }

    return await this.queryBus.execute<
      AICompareResumeWithVacancyQuery,
      AICompareResumeWithVacancyQueryResponse
    >(new AICompareResumeWithVacancyQuery(resume, vacancy.parsedData));
  }
}

export type CompareResumeQueryResponse = ResumeMatchResponseDto;
