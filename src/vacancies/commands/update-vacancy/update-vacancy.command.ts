import type { VacancyStatus } from '../../enums/vacancy-status.enum';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';

export interface UpdateVacancyCommandPayload {
  vacancyId: string;
  userId: string;
  status?: VacancyStatus;
  url?: string;
  parsedData?: ParsedVacancyData;
}

export class UpdateVacancyCommand {
  public readonly vacancyId: string;
  public readonly userId: string;
  public readonly status?: VacancyStatus;
  public readonly url?: string;
  public readonly parsedData?: ParsedVacancyData;

  constructor(payload: UpdateVacancyCommandPayload) {
    this.vacancyId = payload.vacancyId;
    this.userId = payload.userId;
    this.status = payload.status;
    this.url = payload.url;
    this.parsedData = payload.parsedData;
  }
}
