import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../resume.entity';
import type { ParsedResume } from '../presentation/types/resume';

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
  ) {}

  async saveResume(parsedResume: ParsedResume): Promise<Resume> {
    this.logger.log(`Saving resume for user: ${parsedResume.userId}`);

    const {
      id,
      userId,
      title,
      personalDetails: { fullName, jobTitle, ...restPersonalDetails },
      ...restData
    } = parsedResume;

    const resume = this.resumeRepository.create({
      id,
      userId,
      title,
      fullName,
      jobTitle: jobTitle || null,
      parsedData: {
        ...restData,
        personalDetails: restPersonalDetails,
      },
    });

    const savedResume = await this.resumeRepository.save(resume);

    this.logger.log(`Successfully saved resume with ID: ${savedResume.id}`);

    return savedResume;
  }

  async getUserResume(userId: string): Promise<Resume | null> {
    this.logger.log(`Getting resume for user: ${userId}`);

    const resume = await this.resumeRepository.findOne({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (!resume) {
      this.logger.warn(`No resume found for user: ${userId}`);
      return null;
    }

    return resume;
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

  private mapToParsedResume(resume: Resume): ParsedResume {
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
    };
  }
}
