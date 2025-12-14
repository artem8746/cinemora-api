import { UploadedFile } from '@/files/presentation/types/file.interface';

export class ParseResumeCommand {
  constructor(
    public readonly userId: string,
    public readonly file: UploadedFile,
  ) {}
}
