import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParseResumeCommand } from './parse-resume.command';
import { SaveResumeCommand } from '@/resume/application/commands/save-resume/save-resume.command';
import { ResumeParsePdfService } from '../../resume-parse-pdf.service';
import { ParseResumeRawContentCommand } from '@/openai/commands/parse-text-to-resume/parse-text-to-resume.command';
import { ParsedResume } from '@/resume/presentation/types/resume';
import { ResumeContentMapper } from '../../resume-content.mapper';
import { ResumeParsedContent } from '@/openai/types/resume';
import { ResumeCustomizationService } from '../../resume-customization.service';
import { ResumeService } from '../../resume.service';

@CommandHandler(ParseResumeCommand)
export class ParseResumeHandler implements ICommandHandler<ParseResumeCommand> {
  constructor(
    private readonly resumeParsePdfService: ResumeParsePdfService,
    private readonly commandBus: CommandBus,
    private readonly resumeCustomizationService: ResumeCustomizationService,
    private readonly resumeService: ResumeService,
  ) {}

  async execute(command: ParseResumeCommand): Promise<ParsedResume> {
    const { file, userId } = command;

    const rawContent =
      await this.resumeParsePdfService.getResumeRawContent(file);

    const parsedContent = await this.commandBus.execute<
      ParseResumeRawContentCommand,
      ResumeParsedContent
    >(new ParseResumeRawContentCommand(rawContent));

    const customization =
      await this.resumeCustomizationService.getCustomization(
        userId,
        parsedContent,
      );

    const parsedResume = ResumeContentMapper.toParsedResume(
      parsedContent,
      customization,
      userId,
    );

    const existingResume = await this.resumeService.getUserResume(userId);
    if (!existingResume) {
      await this.commandBus.execute(
        new SaveResumeCommand(userId, parsedResume),
      );
    }

    return parsedResume;
  }
}

export type ParseResumeCommandResponse = ReturnType<
  ParseResumeHandler['execute']
>;
