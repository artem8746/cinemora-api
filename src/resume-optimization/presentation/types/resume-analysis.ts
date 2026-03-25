import type {
  ParsedResume,
  Customization,
  ProfileEntry,
  WorkEntry,
  SkillEntry,
  ProjectEntry,
  EducationEntry,
} from '@/resume/presentation/types/resume';

export enum ResumeAnalysisStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface KeySkillMatch {
  skill: string;
  status: 'match' | 'partial' | 'missing';
  message: string;
}

export interface EntryChange {
  entryId: string;
  description: string;
  atsScoreImpact: number;
  matchScoreImpact: number;
}

export interface SectionChangeSummary {
  summary: string;
  entryChanges?: EntryChange[];
}

export interface SuggestedContentPatch {
  personalDetails?: Partial<ParsedResume['personalDetails']>;
  content?: {
    profile?: { entries: ProfileEntry[] };
    work?: { entries: WorkEntry[] };
    skill?: { entries: SkillEntry[] };
    project?: { entries: ProjectEntry[] };
    education?: { entries: EducationEntry[] };
    [key: string]: { entries: unknown[] } | undefined;
  };
  customization?: Partial<Customization>;
}

export interface ResumeOptimizationResult {
  analysis: {
    initialAtsScore: number;
    initialMatchScore: number;
    keySkillsMatch: KeySkillMatch[];
    strengths: string[];
    improvements: string[];
  };
  suggestedContent: SuggestedContentPatch;
  sectionChanges: Record<string, SectionChangeSummary>;
}

export interface CompletedAnalysisPayload {
  analysis: ResumeOptimizationResult['analysis'];
  suggestedContent: SuggestedContentPatch;
  sectionChanges: Record<string, SectionChangeSummary>;
}
