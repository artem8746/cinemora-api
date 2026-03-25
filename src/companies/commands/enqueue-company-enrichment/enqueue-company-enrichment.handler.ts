import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { CompaniesService } from '@/companies/companies.service';
import { EnqueueCompanyEnrichmentCommand } from './enqueue-company-enrichment.command';

@CommandHandler(EnqueueCompanyEnrichmentCommand)
@Injectable()
export class EnqueueCompanyEnrichmentHandler implements ICommandHandler<EnqueueCompanyEnrichmentCommand> {
  constructor(private readonly companiesService: CompaniesService) {}

  execute(command: EnqueueCompanyEnrichmentCommand): Promise<void> {
    this.companiesService.enqueueEnrichment({
      companyId: command.companyId,
      vacancyId: command.vacancyId,
      vacancyText: command.vacancyText,
      companyName: command.companyName,
      vacancyUrl: command.vacancyUrl,
    });

    return Promise.resolve();
  }
}
