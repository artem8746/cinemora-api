import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SaveVacancyCommand } from './save-vacancy.command';
import { Vacancy } from '../../vacancy.entity';
import { VacanciesService } from '../../vacancies.service';
import { GetUserByIdQuery } from '@/users/queries/get-user-by-id/get-user-by-id.query';
import { GetUserByIdQueryResponse } from '@/users/queries/get-user-by-id/get-user-by-id.handler';
import { User } from '@/users/user.entity';
import type { ParsedVacancyData } from '@/openai/types/parsed-vacancy.type';
import { ResolveCompanyForVacancyCommand } from '@/companies/commands/resolve-company-for-vacancy/resolve-company-for-vacancy.command';
import { ResolveCompanyForVacancyCommandResponse } from '@/companies/commands/resolve-company-for-vacancy/resolve-company-for-vacancy.handler';
import { EnqueueCompanyEnrichmentCommand } from '@/companies/commands/enqueue-company-enrichment/enqueue-company-enrichment.command';

@CommandHandler(SaveVacancyCommand)
@Injectable()
export class SaveVacancyHandler implements ICommandHandler<SaveVacancyCommand> {
  constructor(
    private readonly vacanciesService: VacanciesService,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SaveVacancyCommand): Promise<Vacancy> {
    const { url, parsedData, userId } = command;
    const companyName = parsedData.company?.trim();

    const userResult: User | null = await this.queryBus.execute<
      GetUserByIdQuery,
      GetUserByIdQueryResponse
    >(new GetUserByIdQuery(userId));

    if (!userResult) {
      throw new NotFoundException(`User with ID not found: ${userId}`);
    }

    const resolvedCompany =
      companyName && companyName.length > 0
        ? await this.commandBus.execute<
            ResolveCompanyForVacancyCommand,
            ResolveCompanyForVacancyCommandResponse
          >(
            new ResolveCompanyForVacancyCommand({
              companyName,
              vacancyUrl: url,
              parsedData,
            }),
          )
        : null;

    const saveResult = await this.vacanciesService.saveVacancy({
      url,
      parsedData,
      user: userResult,
      companyId: resolvedCompany?.id ?? null,
    });

    if (saveResult.isNewVacancy && resolvedCompany && companyName) {
      await this.commandBus.execute(
        new EnqueueCompanyEnrichmentCommand({
          companyId: resolvedCompany.id,
          vacancyId: saveResult.vacancy.id,
          vacancyText: this.buildVacancyContext(parsedData),
          companyName,
          vacancyUrl: url,
        }),
      );
    }

    return saveResult.vacancy;
  }

  private buildVacancyContext(parsedData: ParsedVacancyData): string {
    const parts: string[] = [];

    if (parsedData.title) {
      parts.push(`Title: ${parsedData.title}`);
    }
    if (parsedData.company) {
      parts.push(`Company: ${parsedData.company}`);
    }
    if (parsedData.description) {
      parts.push(`Description: ${parsedData.description}`);
    }
    if (parsedData.requirements && parsedData.requirements.length > 0) {
      parts.push(`Requirements: ${parsedData.requirements.join('; ')}`);
    }
    if (parsedData.responsibilities && parsedData.responsibilities.length > 0) {
      parts.push(`Responsibilities: ${parsedData.responsibilities.join('; ')}`);
    }
    if (parsedData.benefits && parsedData.benefits.length > 0) {
      parts.push(`Benefits: ${parsedData.benefits.join('; ')}`);
    }
    if (parsedData.skills && parsedData.skills.length > 0) {
      parts.push(`Skills: ${parsedData.skills.join('; ')}`);
    }

    return parts.join('\n').substring(0, 30000);
  }
}

export type SaveVacancyCommandResponse = Vacancy;
