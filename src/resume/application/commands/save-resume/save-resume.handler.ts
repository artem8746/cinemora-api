import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { SaveResumeCommand } from './save-resume.command';
import { ResumeService } from '../../resume.service';
import { Resume } from '@/resume/resume.entity';
import { SaveResumeInput } from '../../../presentation/types/resume';

@CommandHandler(SaveResumeCommand)
@Injectable()
export class SaveResumeHandler implements ICommandHandler<SaveResumeCommand> {
  private readonly logger = new Logger(SaveResumeHandler.name);

  constructor(private readonly resumeService: ResumeService) {}

  async execute(command: SaveResumeCommand): Promise<Resume> {
    const { userId, resume, vacancyId, analysisId } = command;

    if (Boolean(vacancyId) !== Boolean(analysisId)) {
      throw new BadRequestException(
        'vacancyId and analysisId must be provided together or omitted together',
      );
    }

    const parsedResume: SaveResumeInput = {
      ...resume,
      userId,
      id: vacancyId ? undefined : (resume.id ?? ''),
    };

    return await this.resumeService.saveResume(
      parsedResume,
      vacancyId,
      analysisId,
    );
  }
}

export type SaveResumeCommandResponse = Resume;
