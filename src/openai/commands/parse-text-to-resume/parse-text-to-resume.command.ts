import { ResumeRawContent } from '@/resume/presentation/types/resume';

export class ParseResumeRawContentCommand {
  constructor(public readonly rawContent: ResumeRawContent) {}
}
