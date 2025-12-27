import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';

export interface SaveVacancyCommandPayload {
  url?: string;
  parsedData: ParsedVacancyData;
  userId: string;
}

export class SaveVacancyCommand {
  public readonly url?: string;
  public readonly parsedData: ParsedVacancyData;
  public readonly userId: string;

  constructor(payload: SaveVacancyCommandPayload) {
    this.url = payload.url;
    this.parsedData = payload.parsedData;
    this.userId = payload.userId;
  }
}
