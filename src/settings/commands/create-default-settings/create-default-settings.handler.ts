import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDefaultSettingsCommand } from './create-default-settings.command';
import { SettingsService } from '@/settings/settings.service';
import { Settings } from '@/settings/settings.entity';

@CommandHandler(CreateDefaultSettingsCommand)
export class CreateDefaultSettingsHandler implements ICommandHandler<CreateDefaultSettingsCommand> {
  constructor(private readonly settingsService: SettingsService) {}

  execute(command: CreateDefaultSettingsCommand): Promise<Settings> {
    const { userId } = command;

    return this.settingsService.createDefaultSettings(userId);
  }
}

export type CreateDefaultSettingsCommandResponse = ReturnType<
  CreateDefaultSettingsHandler['execute']
>;
