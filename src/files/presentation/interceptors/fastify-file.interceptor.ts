import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { UploadedFile } from '../types/file.interface';

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  constructor(private readonly fieldName: string) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!request.isMultipart()) {
      return next.handle();
    }

    // Get all parts of the multipart request
    const parts = request.parts();
    let targetFile: UploadedFile | null = null;

    // Iterate through parts to find the file with matching field name
    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === this.fieldName) {
        const buffer = await part.toBuffer();
        targetFile = {
          fieldname: part.fieldname,
          filename: part.filename || '',
          encoding: part.encoding,
          mimetype: part.mimetype || 'application/octet-stream',
          buffer: buffer,
          size: buffer.length,
        };
        break;
      }
    }

    // Attach file to request object for @UploadedFile() decorator
    // NestJS expects it at request.file by default
    if (targetFile) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (request as any).file = targetFile;
    }

    return next.handle();
  }
}
