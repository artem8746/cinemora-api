export interface ParsedVacancyData {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  description: string;
  employmentType: string | null;
  workType: string | null;
  duration: string | null;
  experienceLevel: string | null;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  skills: string[];
  benefits: string[];
}

export interface ParsedVacancyResponse {
  isVacancy: boolean;
  data: ParsedVacancyData | null;
}
