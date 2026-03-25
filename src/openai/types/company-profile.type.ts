export interface CompanyReviewsSummary {
  rating: number | null;
  pros: string[];
  cons: string[];
  sampleSize: number | null;
  source: string | null;
}

export interface CompanySourceRef {
  type: string;
  url: string | null;
}

export interface CompanyProfileDto {
  displayName: string;
  normalizedName: string;
  domain: string | null;
  pageUrl: string | null;
  description: string | null;
  industry: string | null;
  headquarters: string | null;
  size: string | null;
  reviewsSummary: CompanyReviewsSummary | null;
  confidence: number;
  sources: CompanySourceRef[];
}
