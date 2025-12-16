import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { Configuration } from '@/config';
import { getParseVacancyPrompt } from './prompts/parse-vacancy.prompt';
import type { ParsedVacancyResponse } from './types/parsed-vacancy.type';

@Injectable()
export class OpenAIService {
  private readonly client: OpenAI;

  constructor(private readonly configService: ConfigService<Configuration>) {
    const apiKey: string = this.configService.getOrThrow(
      'openai.apiKey' as const,
    );

    this.client = new OpenAI({ apiKey });
  }

  async createCompletion(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    return typeof content === 'string'
      ? content
      : JSON.stringify(content ?? '');
  }

  async parseVacancy(
    content: string,
    url: string,
  ): Promise<ParsedVacancyResponse> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a vacancy parser. Extract all data and translate everything to English. Respond only with valid JSON without markdown formatting.',
        },
        {
          role: 'user',
          content: getParseVacancyPrompt(url, content),
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
}
