import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Settings } from './settings.entity';
import { CreateDefaultSettingsHandler } from './commands/create-default-settings/create-default-settings.handler';

export const CommandHandlers = [CreateDefaultSettingsHandler];

@Module({
  imports: [TypeOrmModule.forFeature([Settings]), CqrsModule],
  controllers: [SettingsController],
  providers: [SettingsService, ...CommandHandlers],
  exports: [SettingsService, ...CommandHandlers],
})
export class SettingsModule {}
