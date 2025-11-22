// Request-related swagger decorators for file uploads
// Currently, file uploads use multipart/form-data handled by FileInterceptor
// Add @ApiBody decorators here if needed for future endpoints

import { ApiBody } from '@nestjs/swagger';

export const FileRequests = {
  FileUploadRequest: ApiBody({
    description: 'File upload request',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  }),
};
