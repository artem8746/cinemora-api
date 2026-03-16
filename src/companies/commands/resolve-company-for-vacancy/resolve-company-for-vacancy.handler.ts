import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CompaniesService } from '@/companies/companies.service';
import { Company } from '@/companies/company.entity';
import { ResolveCompanyForVacancyCommand } from './resolve-company-for-vacancy.command';

@CommandHandler(ResolveCompanyForVacancyCommand)
@Injectable()
export class ResolveCompanyForVacancyHandler implements ICommandHandler<ResolveCompanyForVacancyCommand> {
  constructor(private readonly companiesService: CompaniesService) {}

  async execute(
    command: ResolveCompanyForVacancyCommand,
  ): Promise<Company | null> {
    return await this.companiesService.resolveCompanyForVacancy({
      companyName: command.companyName,
      vacancyUrl: command.vacancyUrl,
      parsedData: command.parsedData,
    });
  }
}

export type ResolveCompanyForVacancyCommandResponse = Company | null;
