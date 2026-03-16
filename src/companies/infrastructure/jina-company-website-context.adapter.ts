import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Configuration } from '@/config';
import { cleanHTML } from '@/utils';
import { CompanyWebsiteContextPort } from '@/companies/domain/company-website-context.port';

@Injectable()
export class JinaCompanyWebsiteContextAdapter implements CompanyWebsiteContextPort {
  private readonly jinaApiUrl: string;

  constructor(private readonly configService: ConfigService<Configuration>) {
    this.jinaApiUrl = this.configService.getOrThrow('jina.apiUrl');
  }

  async fetchWebsiteContent(url: string): Promise<string | null> {
    try {
      const jinaResponse = await fetch(`${this.jinaApiUrl}/${url}`);
      if (jinaResponse.ok) {
        const content = await jinaResponse.text();
        return content.substring(0, 30000);
      }
    } catch (_error) {
      // Fall through to direct fetch.
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return null;
      }

      const html = await response.text();
      return cleanHTML(html).substring(0, 30000);
    } catch (_error) {
      return null;
    }
  }
}
