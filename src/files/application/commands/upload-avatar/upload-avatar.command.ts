import { UploadedFile } from '../../../presentation/types/file.interface';

export class UploadAvatarCommand {
  constructor(
    public readonly userId: string,
    public readonly file: UploadedFile,
  ) {}
}
