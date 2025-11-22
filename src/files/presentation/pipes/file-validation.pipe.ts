import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import {
  FILE_VALIDATION_CONSTANTS,
  FileType,
} from '../../domain/file-validation.constants';
import { bytesToMegabytes } from '../utils/file-size.helper';
import { UploadedFile } from '../types/file.interface';

function getValidationRules(fileType: FileType) {
  switch (fileType) {
    case 'avatar':
      return FILE_VALIDATION_CONSTANTS.AVATAR;
    case 'resume':
      return FILE_VALIDATION_CONSTANTS.RESUME;
  }
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly fileType: FileType) {}

  transform(file: UploadedFile, _metadata: ArgumentMetadata): UploadedFile {
    if (!file.buffer) {
      throw new BadRequestException({
        error: {
          message: 'File is required',
        },
        status: 400,
      });
    }

    const validationRules = getValidationRules(this.fileType);

    // Validate file size
    if (file.size > validationRules.MAX_SIZE_BYTES) {
      const maxSizeMB = bytesToMegabytes(validationRules.MAX_SIZE_BYTES);
      throw new BadRequestException({
        error: {
          message: `File size exceeds the maximum allowed size of ${maxSizeMB}MB`,
          details: {
            maxSize: validationRules.MAX_SIZE_BYTES,
            actualSize: file.size,
            maxSizeMB: maxSizeMB.toFixed(2),
            actualSizeMB: bytesToMegabytes(file.size).toFixed(2),
          },
        },
        status: 400,
      });
    }

    // Validate MIME type
    const allowedMimeTypes =
      validationRules.ALLOWED_MIME_TYPES as readonly string[];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException({
        error: {
          message: `Invalid file type. Allowed types: ${validationRules.ALLOWED_MIME_TYPES.join(', ')}`,
          details: {
            allowedMimeTypes: validationRules.ALLOWED_MIME_TYPES,
            receivedMimeType: file.mimetype,
          },
        },
        status: 400,
      });
    }

    // Additional validation: Check if buffer exists
    if (!file.buffer.?length) {
      throw new BadRequestException({
        error: {
          message: 'File buffer is empty or invalid',
        },
        status: 400,
      });
    }

    // Additional validation: Check if size matches buffer length
    if (file.buffer.length !== file.size) {
      throw new BadRequestException({
        error: {
          message: 'File size mismatch between metadata and buffer',
        },
        status: 400,
      });
    }

    return file;
  }
}
