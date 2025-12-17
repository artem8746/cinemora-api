import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadAvatarCommand } from './upload-avatar.command';
import { FileStorageService } from '../../file-storage.service';
@CommandHandler(UploadAvatarCommand)
export class UploadAvatarHandler implements ICommandHandler<UploadAvatarCommand> {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async execute(command: UploadAvatarCommand): Promise<string> {
    const { userId, file } = command;

    const url = await this.fileStorageService.uploadAvatar(
      userId,
      file.buffer,
      file.mimetype,
      file.size,
    );

    return url;
  }
}

export type UploadAvatarCommandResponse = string;
