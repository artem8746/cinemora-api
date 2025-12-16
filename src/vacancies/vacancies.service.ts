import { Injectable, Logger } from '@nestjs/common';
import { OpenAIService } from '@/openai/openai.service';
import { cleanHTML } from '@/utils';
import type { ParsedVacancyResponse } from '@/openai/types/parsed-vacancy.type';

export type ParsedVacancy = ParsedVacancyResponse;

@Injectable()
export class VacanciesService {
  private readonly logger = new Logger(VacanciesService.name);

  constructor(private readonly openAIService: OpenAIService) {}

  async parseVacancy(url: string): Promise<ParsedVacancy> {
    this.logger.log(`Starting vacancy parsing for URL: ${url}`);

    try {
      // Try via Jina (fast and free)
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`);

      if (!jinaResponse.ok) {
        throw new Error(
          `Jina API returned ${jinaResponse.status}: ${jinaResponse.statusText}`,
        );
      }

      const markdown = await jinaResponse.text();
      this.logger.log(
        `Successfully fetched content (${markdown.length} characters)`,
      );
      const result = await this.openAIService.parseVacancy(markdown, url);
      this.logger.log(`Successfully parsed vacancy`);
      return result;
    } catch (error) {
      // Fallback: direct fetch
      this.logger.warn(
        `Failed to fetch via primary method, trying fallback: ${error instanceof Error ? error.message : String(error)}`,
      );

      try {
        const htmlResponse = await fetch(url);

        if (!htmlResponse.ok) {
          throw new Error(
            `Failed to fetch HTML: ${htmlResponse.status} ${htmlResponse.statusText}`,
          );
        }

        const html = await htmlResponse.text();
        const cleaned = cleanHTML(html);
        this.logger.log(
          `Successfully fetched and cleaned HTML (${cleaned.length} characters after cleaning)`,
        );
        const result = await this.openAIService.parseVacancy(cleaned, url);
        this.logger.log(`Successfully parsed vacancy`);
        return result;
      } catch (fallbackError) {
        this.logger.error(
          `Failed to parse vacancy from ${url}: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`,
        );
        throw new Error(
          `Failed to parse vacancy: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        );
      }
    }
  }
}
