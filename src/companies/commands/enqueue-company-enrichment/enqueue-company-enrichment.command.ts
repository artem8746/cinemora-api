export interface EnqueueCompanyEnrichmentCommandPayload {
  companyId: string;
  vacancyId: string;
  vacancyText: string;
  companyName: string;
  vacancyUrl?: string | null;
}

export class EnqueueCompanyEnrichmentCommand {
  public readonly companyId: string;
  public readonly vacancyId: string;
  public readonly vacancyText: string;
  public readonly companyName: string;
  public readonly vacancyUrl?: string | null;

  constructor(payload: EnqueueCompanyEnrichmentCommandPayload) {
    this.companyId = payload.companyId;
    this.vacancyId = payload.vacancyId;
    this.vacancyText = payload.vacancyText;
    this.companyName = payload.companyName;
    this.vacancyUrl = payload.vacancyUrl;
  }
}
