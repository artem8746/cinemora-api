import { ApiBody } from '@nestjs/swagger';
import { GeneratePdfDto } from '../presentation/dto/generate-pdf.dto';

export const PdfRequests = {
  GeneratePdfRequest: ApiBody({
    description: 'HTML content to convert to PDF',
    type: GeneratePdfDto,
    examples: {
      simple: {
        value: {
          html: '<h1>Hello World</h1><p>This is a sample HTML content.</p>',
        },
      },
      styled: {
        value: {
          html: `
            <div style="padding: 20px; background-color: #f0f0f0;">
              <h1 style="color: #333;">Styled Document</h1>
              <p style="font-size: 16px; line-height: 1.6;">
                This HTML includes inline styles that will be preserved in the PDF.
              </p>
              <a href="https://example.com" style="color: #0066cc;">Example Link</a>
            </div>
          `,
        },
      },
    },
  }),
};
