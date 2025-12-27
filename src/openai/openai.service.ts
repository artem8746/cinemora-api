import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Configuration } from '@/config';
import type { ParsedVacancyResponse } from './types/parsed-vacancy.type';
import type { ParsedVacancyData } from './types/parsed-vacancy.type';
import { ParsedResume } from '@/resume/presentation/types/resume';
import { ResumeRawContent } from '@/resume/presentation/types/resume';
import { RESUME_PARSER_SYSTEM } from './constants/prompts/resume.prompt';
import {
  VACANCY_PARSER_SYSTEM,
  VACANCY_PARSER_PROMPT,
} from './constants/prompts/vacancy.prompt';
import {
  RESUME_COMPARISON_SYSTEM_PROMPT,
  getResumeComparisonPrompt,
} from './constants/prompts/resume-comparison.prompt';
import type { ResumeMatchResponseDto } from '@/resume/presentation/dto/compare-resume.dto';
import { removeMarkdownCodeBlocks } from '@/utils';

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
            content: RESUME_PARSER_SYSTEM,
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

  async parseVacancy(content: string): Promise<ParsedVacancyResponse> {
    const truncatedContent = content.substring(0, 40000);
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: VACANCY_PARSER_SYSTEM,
        },
        {
          role: 'user',
          content: `${truncatedContent}\n\n${VACANCY_PARSER_PROMPT}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0,
    });

    const data = response.choices[0]?.message?.content;
    if (!data) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      return JSON.parse(data) as ParsedVacancyResponse;
    } catch (parseError) {
      throw new Error(
        `Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
      );
    }
  }

  async compareResumeWithVacancy(
    resume: ParsedResume,
    vacancy: ParsedVacancyData,
  ): Promise<ResumeMatchResponseDto> {
    try {
      this.logger.log('Comparing resume with vacancy');

      const resumeJson = JSON.stringify(resume, null, 2);
      const vacancyJson = JSON.stringify(vacancy, null, 2);

      // Validate that we have meaningful data
      if (!resumeJson || resumeJson.length < 50) {
        throw new Error('Resume data is too short or empty');
      }
      if (!vacancyJson || vacancyJson.length < 50) {
        throw new Error('Vacancy data is too short or empty');
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: RESUME_COMPARISON_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: getResumeComparisonPrompt(resumeJson, vacancyJson),
          },
        ],
        temperature: 0.3,
      });

      const content = response.choices[0]?.message.content;
      if (!content) {
        throw new Error('Failed to compare resume: empty response from OpenAI');
      }

      const parsedContent = removeMarkdownCodeBlocks(content);

      let comparison: ResumeMatchResponseDto;
      try {
        comparison = JSON.parse(parsedContent) as ResumeMatchResponseDto;
      } catch (parseError) {
        this.logger.error(
          `Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        );
        throw new Error(
          `Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
        );
      }

      comparison.keySkillsMatch = comparison.keySkillsMatch ?? [];
      comparison.strengths = comparison.strengths ?? [];
      comparison.toImprove = comparison.toImprove ?? [];
      comparison.aiInsights = comparison.aiInsights ?? {
        atsScore: 0,
        keywordMatch: 0,
        experienceMatch: 0,
      };

      return comparison;
    } catch (error) {
      this.logger.error(
        `Error comparing resume with vacancy: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      throw error;
    }
  }
}
