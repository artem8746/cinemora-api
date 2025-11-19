import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UploadResumeCommand } from './upload-resume.command';
import { FileStorageService } from '../../file-storage.service';
import { ResumeUploadedEvent } from '../../events/resume-uploaded.event';

@CommandHandler(UploadResumeCommand)
export class UploadResumeHandler
  implements ICommandHandler<UploadResumeCommand>
{
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadResumeCommand): Promise<string> {
    const { userId, file } = command;

    const url = await this.fileStorageService.uploadResume(
      userId,
      file.buffer,
      file.mimetype,
      file.size,
    );

    const event = new ResumeUploadedEvent(userId, url, new Date());
    this.eventBus.publish(event);

    return url;
  }
}

export type UploadResumeCommandResponse = string;
