import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryBus } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { cleanHTML } from '@/utils';
import type { ParsedVacancyResponse } from '@/openai/types/parsed-vacancy.type';
import type { Configuration } from '@/config';
import { Vacancy } from './vacancy.entity';
import { VacancyStatus } from './enums/vacancy-status.enum';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';
import { User } from '@/users/user.entity';
import { ParseVacancyQuery } from '@/openai/queries/parse-vacancy/parse-vacancy.query';
import { ParseVacancyQueryResponse } from '@/openai/queries/parse-vacancy/parse-vacancy.handler';
import type { VacanciesByStatusDto } from './dto/vacancies-by-status.dto';

export type ParsedVacancy = ParsedVacancyResponse;

@Injectable()
export class VacanciesService {
  private readonly logger = new Logger(VacanciesService.name);
  private readonly jinaApiUrl: string;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService<Configuration>,
    @InjectRepository(Vacancy)
    private readonly vacancyRepository: Repository<Vacancy>,
  ) {
    this.jinaApiUrl = this.configService.getOrThrow('jina.apiUrl');
  }

  async parseVacancy(url: string): Promise<ParsedVacancy> {
    this.logger.log(`Starting vacancy parsing for URL: ${url}`);

    const cachedVacancy = await this.getCachedVacancy(url);
    if (cachedVacancy) {
      return cachedVacancy;
    }

    this.logger.log(`Vacancy not found in database, proceeding with parsing`);

    try {
      return await this.parseViaJina(url);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch via primary method, trying fallback: ${error instanceof Error ? error.message : String(error)}`,
      );

      try {
        return await this.parseViaDirectFetch(url);
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

  private async getCachedVacancy(url: string): Promise<ParsedVacancy | null> {
    const existingVacancy = await this.findVacancyByUrl(url);

    if (existingVacancy && existingVacancy.parsedData) {
      this.logger.log(
        `Found existing vacancy in database for URL: ${url}, returning cached data`,
      );
      return {
        isVacancy: true,
        data: existingVacancy.parsedData,
      };
    }

    return null;
  }

  private async findVacancyByUrl(url: string): Promise<Vacancy | null> {
    return await this.vacancyRepository.findOne({
      where: { url },
    });
  }

  private createVacancyEntity(
    url: string | null,
    parsedData: ParsedVacancyData,
  ): Vacancy {
    return this.vacancyRepository.create({
      url,
      status: VacancyStatus.SENT_CV,
      parsedData,
    });
  }

  private async saveVacancyEntity(vacancy: Vacancy): Promise<Vacancy> {
    return await this.vacancyRepository.save(vacancy);
  }

  private async parseViaJina(url: string): Promise<ParsedVacancy> {
    const jinaResponse = await fetch(`${this.jinaApiUrl}/${url}`);

    if (!jinaResponse.ok) {
      throw new Error(
        `Jina API returned ${jinaResponse.status}: ${jinaResponse.statusText}`,
      );
    }

    const markdown = await jinaResponse.text();
    this.logger.log(
      `Successfully fetched content (${markdown.length} characters)`,
    );

    const result = await this.parseVacancyContent(markdown);
    this.logger.log(`Successfully parsed vacancy`);
    return result;
  }

  private async parseViaDirectFetch(url: string): Promise<ParsedVacancy> {
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

    const result = await this.parseVacancyContent(cleaned);
    this.logger.log(`Successfully parsed vacancy`);
    return result;
  }

  async parseVacancyFromText(text: string): Promise<ParsedVacancy> {
    this.logger.log(
      `Starting vacancy parsing from text (${text.length} characters)`,
    );

    const result = await this.parseVacancyContent(text);
    this.logger.log(`Successfully parsed vacancy from text`);
    return result;
  }

  private async parseVacancyContent(
    content: string,
  ): Promise<ParsedVacancyResponse> {
    return await this.queryBus.execute<
      ParseVacancyQuery,
      ParseVacancyQueryResponse
    >(new ParseVacancyQuery(content));
  }

  async saveVacancy(
    url: string | null | undefined,
    parsedData: ParsedVacancyData,
    user: User,
  ): Promise<Vacancy> {
    const logMessage = url
      ? `Saving vacancy with URL: ${url} for user: ${user.id}`
      : `Saving vacancy without URL for user: ${user.id}`;
    this.logger.log(logMessage);

    let vacancy: Vacancy | null = null;

    if (url) {
      vacancy = await this.findVacancyByUrl(url);
    }

    if (vacancy) {
      this.logger.log(`Found existing vacancy with ID: ${vacancy.id}`);
      vacancy.parsedData = parsedData;
      await this.vacancyRepository.save(vacancy);
    } else {
      this.logger.log('Creating new vacancy');
      vacancy = this.createVacancyEntity(url || null, parsedData);
      vacancy = await this.vacancyRepository.save(vacancy);
    }

    const relationExists = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.users', 'user')
      .where('vacancy.id = :vacancyId', { vacancyId: vacancy.id })
      .andWhere('user.id = :userId', { userId: user.id })
      .getCount()
      .then((count) => count > 0);

    if (!relationExists) {
      await this.vacancyRepository
        .createQueryBuilder()
        .relation(Vacancy, 'users')
        .of(vacancy.id)
        .add(user.id);

      this.logger.log(`Adding user ${user.id} to vacancy`);
    } else {
      this.logger.log(`User ${user.id} already associated with vacancy`);
    }

    this.logger.log(`Successfully saved vacancy with ID: ${vacancy.id}`);

    return vacancy;
  }

  async findVacanciesByUserId(userId: string): Promise<VacanciesByStatusDto> {
    this.logger.log(`Finding vacancies for user: ${userId}`);
    const vacancies = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.users', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('vacancy.createdAt', 'DESC')
      .getMany();

    return this.groupVacanciesByStatus(vacancies);
  }

  private groupVacanciesByStatus(vacancies: Vacancy[]): VacanciesByStatusDto {
    const grouped: VacanciesByStatusDto = {
      [VacancyStatus.SENT_CV]: [],
      [VacancyStatus.FOLLOWUP]: [],
      [VacancyStatus.TEST_TASK]: [],
      [VacancyStatus.INTERVIEW]: [],
      [VacancyStatus.REJECTED]: [],
      [VacancyStatus.OFFER]: [],
      [VacancyStatus.ARCHIVED]: [],
    };

    vacancies.forEach((vacancy) => {
      grouped[vacancy.status].push(vacancy);
    });

    return grouped;
  }
}
