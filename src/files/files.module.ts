import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { File } from './file.entity';
import { FilesController } from './presentation/files.controller';
import { FileStorageService } from './application/file-storage.service';
import { R2FileStorageService } from './infrastructure/r2-file-storage.service';
import { UploadAvatarHandler } from './application/commands/upload-avatar/upload-avatar.handler';
import { UploadResumeHandler } from './application/commands/upload-resume/upload-resume.handler';
import {
  PUBLIC_FILE_STORAGE,
  PRIVATE_FILE_STORAGE,
} from './domain/file-storage.port';
import { Configuration } from '@/config';
import { createR2Client } from './utils/create-r2-client';

export const CommandHandlers = [UploadAvatarHandler, UploadResumeHandler];

@Module({
  imports: [TypeOrmModule.forFeature([File]), CqrsModule],
  controllers: [FilesController],
  providers: [
    FileStorageService,
    {
      provide: PUBLIC_FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        const client = createR2Client(configService);
        const r2Config = configService.getOrThrow('r2');

        const publicBucketName = r2Config.publicBucketName;

        return new R2FileStorageService(
          client,
          publicBucketName,
          (key: string) => Promise.resolve(`${r2Config.publicUrl}/${key}`),
        );
      },
    },
    {
      provide: PRIVATE_FILE_STORAGE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => {
        const client = createR2Client(configService);
        const r2Config = configService.getOrThrow('r2');
        if (!r2Config) {
          throw new Error('R2 configuration is missing');
        }
        const privateBucketName = r2Config.privateBucketName;

        return new R2FileStorageService(
          client,
          privateBucketName,
          async (key: string, expiresIn = 3600) => {
            const command = new GetObjectCommand({
              Bucket: privateBucketName,
              Key: key,
            });
            return await getSignedUrl(client, command, { expiresIn });
          },
        );
      },
    },
    ...CommandHandlers,
  ],
  exports: [FileStorageService],
})
export class FilesModule {}
