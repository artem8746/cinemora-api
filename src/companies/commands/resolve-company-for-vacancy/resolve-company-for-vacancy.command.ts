import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';

export interface ResolveCompanyForVacancyCommandPayload {
  companyName: string;
  vacancyUrl?: string | null;
  parsedData: ParsedVacancyData;
}

export class ResolveCompanyForVacancyCommand {
  public readonly companyName: string;
  public readonly vacancyUrl?: string | null;
  public readonly parsedData: ParsedVacancyData;

  constructor(payload: ResolveCompanyForVacancyCommandPayload) {
    this.companyName = payload.companyName;
    this.vacancyUrl = payload.vacancyUrl;
    this.parsedData = payload.parsedData;
  }
}
