import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
import { UserVacancyOrderingService } from './services/user-vacancy-ordering.service';

export type ParsedVacancy = ParsedVacancyResponse;
export interface SaveVacancyResult {
  vacancy: Vacancy;
  isNewVacancy: boolean;
}

interface UserVacancyStatusRaw {
  user_vacancy_status: VacancyStatus;
}

@Injectable()
export class VacanciesService {
  private readonly logger = new Logger(VacanciesService.name);
  private readonly jinaApiUrl: string;

  constructor(
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService<Configuration>,
    private readonly userVacancyOrderingService: UserVacancyOrderingService,
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
      relations: {
        company: true,
      },
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

  async saveVacancy(params: {
    url: string | null | undefined;
    parsedData: ParsedVacancyData;
    user: User;
    companyId?: string | null;
  }): Promise<SaveVacancyResult> {
    const { url, parsedData, user, companyId } = params;
    const logMessage = url
      ? `Saving vacancy with URL: ${url} for user: ${user.id}`
      : `Saving vacancy without URL for user: ${user.id}`;
    this.logger.log(logMessage);

    let vacancy: Vacancy | null = null;

    if (url) {
      vacancy = await this.findVacancyByUrl(url);
    }

    let isNewVacancy = false;

    if (vacancy) {
      this.logger.log(`Found existing vacancy with ID: ${vacancy.id}`);
      vacancy.parsedData = parsedData;
      await this.vacancyRepository.save(vacancy);
    } else {
      this.logger.log('Creating new vacancy');
      vacancy = this.createVacancyEntity(url || null, parsedData);
      vacancy.companyId = companyId ?? null;
      vacancy = await this.vacancyRepository.save(vacancy);
      isNewVacancy = true;
    }

    const relationExists = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.users', 'user')
      .where('vacancy.id = :vacancyId', { vacancyId: vacancy.id })
      .andWhere('user.id = :userId', { userId: user.id })
      .getCount()
      .then((count) => count > 0);

    if (!relationExists) {
      const position =
        await this.userVacancyOrderingService.getNextPositionForStatus({
          manager: this.vacancyRepository.manager,
          userId: user.id,
          status: VacancyStatus.SENT_CV,
        });

      await this.vacancyRepository.manager
        .createQueryBuilder()
        .insert()
        .into('user_vacancies')
        .values({
          vacancy_id: vacancy.id,
          user_id: user.id,
          status: VacancyStatus.SENT_CV,
          position,
        })
        .execute();

      this.logger.log(`Adding user ${user.id} to vacancy`);
    } else {
      this.logger.log(`User ${user.id} already associated with vacancy`);
    }

    this.logger.log(`Successfully saved vacancy with ID: ${vacancy.id}`);
    const savedVacancy = await this.findVacancyById({
      vacancyId: vacancy.id,
      userId: user.id,
    });

    return {
      vacancy: savedVacancy,
      isNewVacancy,
    };
  }

  async findVacanciesByUserId(userId: string): Promise<VacanciesByStatusDto> {
    this.logger.log(`Finding vacancies for user: ${userId}`);
    const queryResult = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin(
        'user_vacancies',
        'user_vacancy',
        'user_vacancy.vacancy_id = vacancy.id',
      )
      .leftJoinAndSelect('vacancy.company', 'company')
      .where('user_vacancy.user_id = :userId', { userId })
      .addSelect('user_vacancy.status', 'user_vacancy_status')
      .addSelect('user_vacancy.position', 'user_vacancy_position')
      .orderBy('user_vacancy.status', 'ASC')
      .addOrderBy('user_vacancy.position', 'ASC')
      .getRawAndEntities();

    const rawRows = queryResult.raw as UserVacancyStatusRaw[];
    const vacancies = queryResult.entities.map((vacancy, index) => {
      const row = rawRows[index];
      if (row) {
        vacancy.status = row.user_vacancy_status;
      }
      return vacancy;
    });

    return this.groupVacanciesByStatus(vacancies);
  }

  async findVacancyById(params: {
    vacancyId: string;
    userId: string;
  }): Promise<Vacancy> {
    const { vacancyId, userId } = params;
    this.logger.log(`Finding vacancy ${vacancyId} for user: ${userId}`);
    const vacancy = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin(
        'user_vacancies',
        'user_vacancy',
        'user_vacancy.vacancy_id = vacancy.id',
      )
      .leftJoinAndSelect('vacancy.company', 'company')
      .addSelect('user_vacancy.status', 'user_vacancy_status')
      .where('vacancy.id = :vacancyId', { vacancyId })
      .andWhere('user_vacancy.user_id = :userId', { userId })
      .getRawAndEntities();

    const entity = vacancy.entities[0];
    const raw = (vacancy.raw as UserVacancyStatusRaw[])[0];

    if (!entity || !raw) {
      throw new NotFoundException(
        `Vacancy with ID ${vacancyId} not found or does not belong to user`,
      );
    }

    entity.status = raw.user_vacancy_status;
    return entity;
  }

  async deleteVacancy(params: {
    vacancyId: string;
    userId: string;
  }): Promise<void> {
    const { vacancyId, userId } = params;
    this.logger.log(`Deleting vacancy ${vacancyId} for user: ${userId}`);

    const vacancy = await this.findVacancyById({ vacancyId, userId });

    await this.vacancyRepository.manager.transaction(async (manager) => {
      const userVacancy =
        await this.userVacancyOrderingService.findUserVacancyOrFail({
          manager,
          userId,
          vacancyId,
        });

      await manager
        .createQueryBuilder()
        .delete()
        .from('user_vacancies')
        .where('"user_id" = :userId', { userId })
        .andWhere('"vacancy_id" = :vacancyId', { vacancyId })
        .execute();

      await this.userVacancyOrderingService.compactPositionsAfterDelete({
        manager,
        userId,
        status: userVacancy.status,
        deletedPosition: userVacancy.position,
      });
    });

    this.logger.log(`Removed user ${userId} from vacancy ${vacancyId}`);

    const remainingUsersCount = await this.vacancyRepository
      .createQueryBuilder('vacancy')
      .innerJoin('vacancy.users', 'user')
      .where('vacancy.id = :vacancyId', { vacancyId })
      .getCount();

    if (remainingUsersCount === 0) {
      await this.vacancyRepository.remove(vacancy);
      this.logger.log(
        `Deleted vacancy ${vacancyId} as it has no associated users`,
      );
    } else {
      this.logger.log(
        `Vacancy ${vacancyId} still has ${remainingUsersCount} associated users, keeping it`,
      );
    }
  }

  async updateVacancy(params: {
    vacancyId: string;
    userId: string;
    updateData: {
      status?: VacancyStatus;
      position?: number;
      url?: string;
      parsedData?: ParsedVacancyData;
    };
  }): Promise<Vacancy> {
    const { vacancyId, userId, updateData } = params;
    this.logger.log(`Updating vacancy ${vacancyId} for user: ${userId}`);

    const updatedVacancy = await this.vacancyRepository.manager.transaction(
      async (manager) => {
        const userVacancy =
          await this.userVacancyOrderingService.findUserVacancyOrFail({
            manager,
            userId,
            vacancyId,
          });
        const vacancy = await manager.findOne(Vacancy, {
          where: { id: vacancyId },
          relations: {
            company: true,
          },
        });

        if (!vacancy) {
          throw new NotFoundException(
            `Vacancy with ID ${vacancyId} not found or does not belong to user`,
          );
        }

        if (updateData.url) {
          vacancy.url = updateData.url;
          this.logger.log(`Updating URL to ${updateData.url}`);
        }

        if (updateData.parsedData) {
          vacancy.parsedData = updateData.parsedData;
          this.logger.log('Updating parsed data');
        }

        if (updateData.status || updateData.position !== undefined) {
          await this.userVacancyOrderingService.reorderUserVacancy({
            manager,
            userVacancy,
            targetStatus: updateData.status,
            targetPosition: updateData.position,
          });
        }

        const savedVacancy = await manager.save(vacancy);
        const updatedUserVacancy =
          await this.userVacancyOrderingService.findUserVacancyOrFail({
            manager,
            userId,
            vacancyId,
          });

        savedVacancy.status = updatedUserVacancy.status;
        return savedVacancy;
      },
    );

    this.logger.log(`Successfully updated vacancy ${vacancyId}`);

    return updatedVacancy;
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
