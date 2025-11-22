import { UploadedFile } from '../../../presentation/types/file.interface';

export class UploadResumeCommand {
  constructor(
    public readonly userId: string,
    public readonly file: UploadedFile,
  ) {}
}
