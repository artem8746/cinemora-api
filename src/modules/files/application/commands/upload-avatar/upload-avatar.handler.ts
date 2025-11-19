import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UploadAvatarCommand } from './upload-avatar.command';
import { FileStorageService } from '../../file-storage.service';
import { AvatarUploadedEvent } from '../../events/avatar-uploaded.event';

@CommandHandler(UploadAvatarCommand)
export class UploadAvatarHandler
  implements ICommandHandler<UploadAvatarCommand>
{
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UploadAvatarCommand): Promise<string> {
    const { userId, file } = command;

    const url = await this.fileStorageService.uploadAvatar(
      userId,
      file.buffer,
      file.mimetype,
      file.size,
    );

    const event = new AvatarUploadedEvent(userId, url, new Date());
    this.eventBus.publish(event);

    return url;
  }
}

export type UploadAvatarCommandResponse = string;
