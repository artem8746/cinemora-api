import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
} from './constants/default-settings.constants';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async createDefaultSettings(userId: string): Promise<Settings> {
    const settings = this.settingsRepository.create({
      userId,
      appearance: DEFAULT_APPEARANCE_SETTINGS,
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
    });

    return await this.settingsRepository.save(settings);
  }

  async getSettings(userId: string): Promise<Settings | null> {
    return await this.settingsRepository.findOne({
      where: { userId },
    });
  }

  private async getSettingsOrThrow(userId: string): Promise<Settings> {
    const settings = await this.getSettings(userId);
    if (!settings) {
      throw new NotFoundException(
        `Settings not found for user with id: ${userId}`,
      );
    }
    return settings;
  }

  async getSettingsOrCreateDefault(userId: string): Promise<Settings> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = await this.createDefaultSettings(userId);
    }

    return settings;
  }

  async updateAppearance(
    userId: string,
    updateDto: UpdateAppearanceDto,
  ): Promise<Settings> {
    const settings = await this.getSettingsOrThrow(userId);

    settings.appearance = updateDto;

    return this.settingsRepository.save(settings);
  }

  async updateNotifications(
    userId: string,
    updateDto: UpdateNotificationsDto,
  ): Promise<Settings> {
    const settings = await this.getSettingsOrThrow(userId);

    settings.notifications = updateDto;

    return this.settingsRepository.save(settings);
  }
}
