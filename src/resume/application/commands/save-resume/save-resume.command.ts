import { SaveResumeInput } from '../../../presentation/types/resume';

export class SaveResumeCommand {
  constructor(
    public readonly userId: string,
    public readonly resume: SaveResumeInput,
    public readonly vacancyId?: string,
    public readonly analysisId?: string,
  ) {}
}
