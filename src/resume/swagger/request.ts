// Request-related swagger decorators for file uploads
// Currently, file uploads use multipart/form-data handled by FileInterceptor
// Add @ApiBody decorators here if needed for future endpoints

import { ApiBody } from '@nestjs/swagger';

export const ResumeRequests = {
  FileUploadRequest: ApiBody({
    description: 'PDF resume file upload request',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'PDF resume file (max 5MB)',
        },
      },
    },
  }),
};
