import { InjectRedis } from '@nestjs-modules/ioredis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { Repository } from 'typeorm';
import type { CompanyProfileDto } from '@/openai/types/company-profile.type';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';
import { normalizeUrl } from '@/utils/normalize-url.util';
import { CompanySource, CompanySourceType } from './company-source.entity';
import { Company } from './company.entity';
import {
  COMPANY_PROFILE_SUMMARIZER_PORT,
  CompanyProfileSummarizerPort,
} from './domain/company-profile-summarizer.port';
import {
  COMPANY_WEBSITE_CONTEXT_PORT,
  CompanyWebsiteContextPort,
} from './domain/company-website-context.port';
import { normalizeCompanyName } from './domain/company-name-normalizer';

const PROFILE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REVIEWS_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const SOURCES_RETENTION_DAYS = 30;
const ENRICH_LOCK_TTL_SECONDS = 120;
const NON_COMPANY_HOST_MARKERS = [
  'linkedin.com',
  'indeed.',
  'glassdoor.',
  'hh.ru',
  'djinni',
  'dou.ua',
  'work.ua',
  'rabota.',
  'jooble.',
  'jobs.',
  'career',
  'careers.',
  'monster.',
  'ziprecruiter.',
  'upwork.',
  'freelancer.',
  'wellfound.',
  'greenhouse.io',
  'lever.co',
] as const;

@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanySource)
    private readonly companySourceRepository: Repository<CompanySource>,
    @Inject(COMPANY_PROFILE_SUMMARIZER_PORT)
    private readonly companyProfileSummarizer: CompanyProfileSummarizerPort,
    @Inject(COMPANY_WEBSITE_CONTEXT_PORT)
    private readonly websiteContextProvider: CompanyWebsiteContextPort,
    @InjectRedis() private readonly redisClient: Redis,
  ) {}

  async resolveCompanyForVacancy(params: {
    companyName: string;
    vacancyUrl?: string | null;
    parsedData: ParsedVacancyData;
  }): Promise<Company | null> {
    const { companyName, parsedData } = params;

    const normalizedName = normalizeCompanyName(companyName);
    if (!normalizedName) {
      return null;
    }

    const existing = await this.companyRepository.findOne({
      where: { normalizedName },
    });
    if (existing) {
      return existing;
    }

    const pageUrl = this.extractCompanyWebsite({
      parsedData,
    });
    const domain = pageUrl ? this.extractDomain(pageUrl) : null;

    await this.companyRepository
      .createQueryBuilder()
      .insert()
      .into(Company)
      .values({
        displayName: companyName.trim(),
        normalizedName,
        domain,
        pageUrl,
      })
      .orIgnore()
      .execute();

    return await this.companyRepository.findOne({
      where: { normalizedName },
    });
  }

  enqueueEnrichment(params: {
    companyId: string;
    vacancyId: string;
    vacancyText: string;
    companyName: string;
    vacancyUrl?: string | null;
  }): void {
    void this.enqueueIfNeeded(params);
  }

  private async enqueueIfNeeded(params: {
    companyId: string;
    vacancyId: string;
    vacancyText: string;
    companyName: string;
    vacancyUrl?: string | null;
  }): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id: params.companyId },
    });
    if (!company) {
      return;
    }

    if (this.isCompanyFresh(company)) {
      this.logger.log(`cache_hit company=${company.id}`);
      return;
    }

    this.logger.log(`cache_miss company=${company.id}`);
    setImmediate(() => {
      void this.runEnrichment(params);
    });
  }

  private async runEnrichment(params: {
    companyId: string;
    vacancyId: string;
    vacancyText: string;
    companyName: string;
    vacancyUrl?: string | null;
  }): Promise<void> {
    const { companyId, vacancyId, vacancyText, companyName } = params;

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });
    if (!company) {
      return;
    }

    const normalizedName = company.normalizedName;
    const lockKey = `company_enrichment:lock:${normalizedName}`;
    const lock = await this.redisClient.set(
      lockKey,
      '1',
      'EX',
      ENRICH_LOCK_TTL_SECONDS,
      'NX',
    );

    if (lock !== 'OK') {
      return;
    }

    try {
      this.logger.log(`enrichment_started company=${company.id}`);

      await this.saveVacancyTextSource({
        companyId: company.id,
        vacancyId,
        vacancyText,
      });

      if (this.isCompanyFresh(company)) {
        this.logger.log(`cache_hit company=${company.id}`);
        return;
      }
      this.logger.log(`cache_miss company=${company.id}`);

      const websiteUrl = this.extractCompanyWebsite({
        sourceText: vacancyText,
      });

      const websiteContent = websiteUrl
        ? await this.websiteContextProvider.fetchWebsiteContent(websiteUrl)
        : null;

      if (websiteUrl && websiteContent) {
        await this.saveWebsiteSource({
          companyId: company.id,
          websiteUrl,
          content: websiteContent,
        });
      }

      const summary: CompanyProfileDto =
        await this.companyProfileSummarizer.summarize({
          companyName,
          vacancyText,
          websiteContent,
        });

      const now = new Date();
      const domain =
        summary.domain ??
        (websiteUrl ? this.extractDomain(websiteUrl) : null) ??
        company.domain ??
        null;
      const sourcePageUrl =
        summary.sources.find((source) =>
          this.isLikelyCompanyWebsite(source.url),
        )?.url ?? null;
      const normalizedSummaryPageUrl = normalizeUrl(summary.pageUrl);

      company.displayName = summary.displayName || company.displayName;
      company.domain = domain;
      company.pageUrl =
        (normalizedSummaryPageUrl &&
        this.isLikelyCompanyWebsite(normalizedSummaryPageUrl)
          ? normalizedSummaryPageUrl
          : null) ??
        sourcePageUrl ??
        websiteUrl ??
        company.pageUrl ??
        null;
      company.description = summary.description;
      company.industry = summary.industry;
      company.headquarters = summary.headquarters;
      company.size = summary.size;
      company.reviewsSummary = summary.reviewsSummary;
      company.confidence = this.normalizeConfidence(summary.confidence);
      company.lastVerifiedAt = now;
      company.nextRefreshAt = new Date(
        now.getTime() + Math.min(PROFILE_TTL_MS, REVIEWS_TTL_MS),
      );

      await this.companyRepository.save(company);
      this.logger.log(`enrichment_completed company=${company.id}`);
    } catch (error) {
      this.logger.error(
        `enrichment_failed company=${company.id} error=${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      await this.redisClient.del(lockKey);
    }
  }

  private async saveVacancyTextSource(params: {
    companyId: string;
    vacancyId: string;
    vacancyText: string;
  }): Promise<void> {
    const { companyId, vacancyId, vacancyText } = params;

    await this.companySourceRepository
      .createQueryBuilder()
      .insert()
      .into(CompanySource)
      .values({
        companyId,
        sourceType: CompanySourceType.VACANCY_TEXT,
        sourceUrl: `vacancy://${vacancyId}`,
        payload: {
          vacancyId,
          content: vacancyText.substring(0, 30000),
        },
      })
      .orIgnore()
      .execute();
  }

  private async saveWebsiteSource(params: {
    companyId: string;
    websiteUrl: string;
    content: string;
  }): Promise<void> {
    const { companyId, websiteUrl, content } = params;

    await this.companySourceRepository
      .createQueryBuilder()
      .insert()
      .into(CompanySource)
      .values({
        companyId,
        sourceType: CompanySourceType.COMPANY_WEBSITE,
        sourceUrl: websiteUrl,
        payload: {
          content: content.substring(0, 30000),
        },
      })
      .orIgnore()
      .execute();
  }

  async cleanupOldSources(): Promise<void> {
    await this.companySourceRepository
      .createQueryBuilder()
      .delete()
      .where(`collected_at < NOW() - INTERVAL '${SOURCES_RETENTION_DAYS} days'`)
      .execute();
  }

  private isCompanyFresh(company: Company): boolean {
    if (!company.nextRefreshAt || !company.lastVerifiedAt) {
      return false;
    }

    return company.nextRefreshAt.getTime() > Date.now();
  }

  private extractCompanyWebsite(params: {
    parsedData?: ParsedVacancyData;
    sourceText?: string;
  }): string | null {
    const { parsedData, sourceText } = params;
    const text = sourceText ?? parsedData?.description ?? '';
    const urls = text.match(/https?:\/\/[^\s)]+/gi);

    if (!urls || urls.length === 0) {
      return null;
    }

    for (const rawUrl of urls) {
      const normalizedUrl = normalizeUrl(rawUrl);
      if (!normalizedUrl) {
        continue;
      }
      if (this.isLikelyCompanyWebsite(normalizedUrl)) {
        return normalizedUrl;
      }
    }

    return null;
  }

  private extractDomain(url: string): string | null {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch (_error) {
      return null;
    }
  }

  private isLikelyCompanyWebsite(url: string | null | undefined): boolean {
    if (!url) {
      return false;
    }

    try {
      const host = new URL(url).hostname.toLowerCase();
      return !NON_COMPANY_HOST_MARKERS.some((marker) => host.includes(marker));
    } catch (_error) {
      return false;
    }
  }

  private normalizeConfidence(confidence: number): number {
    if (!Number.isFinite(confidence)) {
      return 0;
    }

    return Math.max(0, Math.min(1, Number(confidence.toFixed(2))));
  }
}
