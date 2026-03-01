import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadResumeCommand } from './upload-resume.command';
import { FileStorageService } from '../../file-storage.service';

@CommandHandler(UploadResumeCommand)
export class UploadResumeHandler
  implements ICommandHandler<UploadResumeCommand>
{
  constructor(private readonly fileStorageService: FileStorageService) {}

  async execute(command: UploadResumeCommand): Promise<string> {
    const { userId, file } = command;

    const url = await this.fileStorageService.uploadResume(
      userId,
      file.buffer,
      file.mimetype,
      file.size,
    );

    return url;
  }
}

export type UploadResumeCommandResponse = string;
