import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseResumeCommand } from './parse-resume.command';
import { ResumeAnalysisService } from '../../resume-analysis.service';
import { ParseResumeRawContentCommand } from '@/openai/commands/parse-text-to-resume/parse-text-to-resume.command';
import { ParsedResume } from '@/resume/presentation/types/resume';
import { ResumeContentMapper } from '../../resume-content.mapper';
import { ResumeParsedContent } from '@/openai/types/resume';
import { ResumeService } from '../../resume.service';

@CommandHandler(ParseResumeCommand)
export class ParseResumeHandler implements ICommandHandler<ParseResumeCommand> {
  constructor(
    private readonly resumeAnalysisService: ResumeAnalysisService,
    private readonly commandBus: CommandBus,
    private readonly resumeService: ResumeService,
  ) {}

  async execute(command: ParseResumeCommand): Promise<ParsedResume> {
    const { file, userId } = command;

    const rawContent =
      await this.resumeAnalysisService.getResumeRawContent(file);

    const parsedContent = await this.commandBus.execute<
      ParseResumeRawContentCommand,
      ResumeParsedContent
    >(new ParseResumeRawContentCommand(rawContent));

    const parsedResume = ResumeContentMapper.toParsedResume(
      parsedContent,
      userId,
    );

    await this.resumeService.saveResume(parsedResume);

    return parsedResume;
  }
}

export type ParseResumeCommandResponse = ReturnType<
  ParseResumeHandler['execute']
>;
