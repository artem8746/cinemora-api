import { Injectable } from '@nestjs/common';
import { ResumeParsedContent } from '@/openai/types/resume';
import { Customization } from '@/resume/presentation/types/resume';

@Injectable()
export class ResumeCustomizationService {
  getCustomization(
    userId: string,
    parsedContent: ResumeParsedContent,
  ): Promise<Customization> {
    // TODO: Fetch user preferences from settings service/repository
    // TODO: Analyze resume content to determine optimal section order
    // TODO: Combine user preferences with content analysis

    const sectionOrder = Object.keys(parsedContent.content);

    return Promise.resolve({
      sectionOrder,
    });
  }
}
