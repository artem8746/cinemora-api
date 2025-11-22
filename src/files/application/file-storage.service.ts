import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, FileType } from '../file.entity';
import {
  IFileStoragePort,
  PRIVATE_FILE_STORAGE,
  PUBLIC_FILE_STORAGE,
} from '../domain/file-storage.port';
import { randomUUID } from 'crypto';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  constructor(
    @Inject(PUBLIC_FILE_STORAGE)
    private readonly publicFileStorage: IFileStoragePort,
    @Inject(PRIVATE_FILE_STORAGE)
    private readonly privateFileStorage: IFileStoragePort,
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
  ) {}

  async uploadAvatar(
    userId: string,
    file: Buffer,
    mimeType: string,
    sizeBytes: number,
  ): Promise<string> {
    this.logger.log(`Uploading avatar for user: ${userId}`);

    const key = this.createAvatarKey(userId, this.getExtension(mimeType));

    await this.publicFileStorage.upload(key, file);

    await this.fileRepository.save({
      userId,
      fileType: FileType.AVATAR,
      key,
      mimeType,
      sizeBytes,
    });

    const url = this.publicFileStorage.getFileUrl(key);

    this.logger.log(`Avatar uploaded and saved to DB: ${key}`);

    return url;
  }

  async uploadResume(
    userId: string,
    file: Buffer,
    mimeType: string,
    sizeBytes: number,
  ): Promise<string> {
    this.logger.log(`Uploading resume for user: ${userId}`);

    const key = this.createResumeKey(userId, this.getExtension(mimeType));

    await this.privateFileStorage.upload(key, file);

    await this.fileRepository.save({
      userId,
      fileType: FileType.RESUME,
      key,
      mimeType,
      sizeBytes,
    });

    const url = this.privateFileStorage.getFileUrl(key);

    this.logger.log(`Resume uploaded and saved to DB: ${key}`);

    return url;
  }

  private getExtension(mimeType: string): string {
    return mimeType.split('/')[1] ?? '';
  }

  private createAvatarKey(userId: string, extension: string): string {
    return `avatars/${userId}.${extension}`;
  }

  private createResumeKey(userId: string, extension: string): string {
    const resumeId = randomUUID();

    return `resumes/${userId}/${resumeId}.${extension}`;
  }
}
