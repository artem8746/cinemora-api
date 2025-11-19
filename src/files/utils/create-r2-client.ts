import { Configuration } from '@/config';
import { S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

export function createR2Client(
  configService: ConfigService<Configuration>,
): S3Client {
  const r2Config = configService.getOrThrow('r2');

  return new S3Client({
    region: 'auto',
    endpoint: `https://${r2Config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: r2Config.accessKeyId,
      secretAccessKey: r2Config.secretAccessKey,
    },
  });
}
