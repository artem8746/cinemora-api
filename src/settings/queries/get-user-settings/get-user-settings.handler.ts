import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetUserSettingsQuery } from './get-user-settings.query';
import { SettingsService } from '@/settings/settings.service';
import { Settings } from '@/settings/settings.entity';

@QueryHandler(GetUserSettingsQuery)
@Injectable()
export class GetUserSettingsHandler
  implements IQueryHandler<GetUserSettingsQuery>
{
  constructor(private readonly settingsService: SettingsService) {}

  async execute(query: GetUserSettingsQuery): Promise<Settings> {
    return await this.settingsService.getSettingsOrCreateDefault(query.userId);
  }
}

export type GetUserSettingsQueryResponse = Settings;
