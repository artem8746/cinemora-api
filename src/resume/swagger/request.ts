import { ApiBody } from '@nestjs/swagger';
import { SaveResumeDto } from '../presentation/dto/save-resume.dto';

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

  SaveResumeRequest: ApiBody({
    description: 'Save resume request body',
    type: SaveResumeDto,
  }),
};
