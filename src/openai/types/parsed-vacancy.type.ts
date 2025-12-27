export interface ParsedVacancyData {
  title?: string | null;
  company?: string | null;
  location?: string | null;
  salary?: string | null;
  description?: string | null;
  employmentType?: string | null;
  workType?: string | null;
  duration?: string | null;
  experienceLevel?: string | null;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  skills?: string[];
  benefits?: string[];
}

export interface ParsedVacancyResponse {
  isVacancy: boolean;
  data: ParsedVacancyData | null;
}
