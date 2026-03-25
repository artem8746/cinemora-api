import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Resume } from '../resume.entity';
import type {
  ParsedResume,
  SaveResumeInput,
} from '../presentation/types/resume';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async saveResume(
    parsedResume: SaveResumeInput,
    vacancyId?: string,
    analysisId?: string,
  ): Promise<Resume> {
    this.logger.log(`Saving resume for user: ${parsedResume.userId}`);

    const { id, userId, title, personalDetails, ...restData } = parsedResume;
    const { fullName, jobTitle, ...restPersonalDetails } = personalDetails;

    const parsedData = {
      ...restData,
      personalDetails: restPersonalDetails,
    } as Resume['parsedData'];

    if (vacancyId) {
      const existing = await this.resumeRepository.findOne({
        where: { userId, vacancyId },
      });

      if (existing) {
        existing.title = title;
        existing.fullName = fullName;
        existing.jobTitle = jobTitle || null;
        existing.analysisId = analysisId ?? existing.analysisId;
        existing.parsedData = parsedData;

        const saved = await this.resumeRepository.save(existing);
        this.logger.log(`Updated vacancy resume ID: ${saved.id}`);
        return saved;
      }
    }

    const resume = this.resumeRepository.create({
      id: vacancyId ? undefined : id,
      userId,
      title,
      fullName,
      jobTitle: jobTitle || null,
      vacancyId: vacancyId ?? null,
      analysisId: analysisId ?? null,
      parsedData,
    });

    const savedResume = await this.resumeRepository.save(resume);
    this.logger.log(`Successfully saved resume with ID: ${savedResume.id}`);

    return savedResume;
  }

  async getResume(userId: string, resumeId?: string): Promise<Resume | null> {
    if (resumeId) {
      const resume = await this.resumeRepository.findOne({
        where: { id: resumeId, userId },
      });
      if (!resume) {
        this.logger.warn(`Resume ${resumeId} not found for user: ${userId}`);
        return null;
      }
      return resume;
    }

    return this.getUserResume(userId);
  }

  async getUserResume(userId: string): Promise<Resume | null> {
    this.logger.log(`Getting main resume for user: ${userId}`);

    const resume = await this.resumeRepository.findOne({
      where: { userId, vacancyId: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!resume) {
      this.logger.warn(`No main resume found for user: ${userId}`);
      return null;
    }

    return resume;
  }

  async getVacancyResume(
    userId: string,
    vacancyId: string,
  ): Promise<Resume | null> {
    return await this.resumeRepository.findOne({
      where: { userId, vacancyId },
    });
  }

  async resolveSourceResume(
    userId: string,
    vacancyId: string,
  ): Promise<ParsedResume> {
    const vacancyResume = await this.getVacancyResume(userId, vacancyId);
    if (vacancyResume) {
      this.logger.log(
        `Using vacancy-specific resume ${vacancyResume.id} as source`,
      );
      return this.mapToParsedResume(vacancyResume);
    }

    const mainResume = await this.getUserResume(userId);
    if (mainResume) {
      this.logger.log(`Using main resume ${mainResume.id} as source`);
      return this.mapToParsedResume(mainResume);
    }

    throw new BadRequestException('Please upload your resume first.');
  }

  async getUserResumeAsParsedResume(
    userId: string,
  ): Promise<ParsedResume | null> {
    const resume = await this.getUserResume(userId);
    if (!resume) {
      return null;
    }

    return this.mapToParsedResume(resume);
  }

  mapToParsedResume(resume: Resume): ParsedResume {
    return {
      id: resume.id,
      userId: resume.userId,
      title: resume.title,
      personalDetails: {
        ...resume.parsedData.personalDetails,
        fullName: resume.fullName,
        jobTitle: resume.jobTitle || '',
      },
      content: resume.parsedData.content,
      customization: resume.parsedData.customization ?? { sectionOrder: [] },
    };
  }
}
