import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { IFileStoragePort } from '../domain/file-storage.port';

@Injectable()
export class R2FileStorageService implements IFileStoragePort {
  private readonly logger = new Logger(R2FileStorageService.name);

  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
    private readonly urlResolver: (
      key: string,
      expiresIn?: number,
    ) => Promise<string>,
  ) {}

  async upload(key: string, body: Buffer): Promise<string> {
    const startTime = Date.now();
    this.logger.log(`Uploading file: ${key} (size: ${body.length} bytes)`);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
        }),
      );

      const url = await this.urlResolver(key);
      const durationMs = Date.now() - startTime;
      this.logger.log(
        `File uploaded successfully: ${key} (duration: ${durationMs}ms)`,
      );

      return url;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `Failed to upload file: ${key} (duration: ${durationMs}ms)`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async getFileUrl(key: string, expiresIn = 3600): Promise<string> {
    this.logger.debug(
      `Generating signed URL for: ${key} (expires in: ${expiresIn}s)`,
    );

    try {
      const url = await this.urlResolver(key, expiresIn);
      this.logger.debug(`Signed URL generated for: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(
        `Failed to generate signed URL for: ${key}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();
    this.logger.log(`Deleting file: ${key}`);

    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );

      const durationMs = Date.now() - startTime;
      this.logger.log(
        `File deleted successfully: ${key} (duration: ${durationMs}ms)`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.logger.error(
        `Failed to delete file: ${key} (duration: ${durationMs}ms)`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
