import { Query } from '@nestjs/cqrs';
import type { Settings } from '@/settings/settings.entity';

export class GetUserSettingsQuery extends Query<Settings> {
  constructor(public readonly userId: string) {
    super();
  }
}
