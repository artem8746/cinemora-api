import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Configuration } from '@/config';
import { ParsedResume } from '@/resume/presentation/types/resume';
import { ResumeRawContent } from '@/resume/presentation/types/resume';
import { OPENAI_PROMPTS } from './constants/prompts';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private readonly configService: ConfigService<Configuration>) {
    const apiKey: string = this.configService.getOrThrow(
      'openai.apiKey' as const,
    );

    this.client = new OpenAI({ apiKey });
  }

  async parseRawResumeContent(
    rawContent: ResumeRawContent,
  ): Promise<ParsedResume> {
    try {
      this.logger.log(`Processing raw resume content`);

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: OPENAI_PROMPTS.RESUME_PARSER_SYSTEM,
          },
          {
            role: 'user',
            content: JSON.stringify(rawContent),
          },
        ],
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('Failed to parse resume: empty response from OpenAI');
      }

      const parsed = JSON.parse(content) as ParsedResume;

      this.logger.debug(
        `Successfully parsed resume: ${parsed.title || 'Untitled'}`,
      );

      return parsed;
    } catch (error) {
      this.logger.error(
        `Error processing resume raw content: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw error;
    }
  }
}
