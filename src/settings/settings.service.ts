import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';
import {
  DEFAULT_APPEARANCE_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_PERSONAL_INFO_SETTINGS,
  DEFAULT_AI_SETTINGS,
  DEFAULT_JOB_PREFERENCES_SETTINGS,
} from './constants/default-settings.constants';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { UpdateAISettingsDto } from './dto/update-ai-settings.dto';
import { UpdateJobPreferencesDto } from './dto/update-job-preferences.dto';

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
      personalInfo: DEFAULT_PERSONAL_INFO_SETTINGS,
      aiSettings: DEFAULT_AI_SETTINGS,
      jobPreferences: DEFAULT_JOB_PREFERENCES_SETTINGS,
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

  async updatePersonalInfo(
    userId: string,
    updateDto: UpdatePersonalInfoDto,
  ): Promise<Settings> {
    const settings = await this.getSettingsOrThrow(userId);

    settings.personalInfo = updateDto;

    return this.settingsRepository.save(settings);
  }

  async updateAISettings(
    userId: string,
    updateDto: UpdateAISettingsDto,
  ): Promise<Settings> {
    const settings = await this.getSettingsOrThrow(userId);

    settings.aiSettings = updateDto;

    return this.settingsRepository.save(settings);
  }

  async updateJobPreferences(
    userId: string,
    updateDto: UpdateJobPreferencesDto,
  ): Promise<Settings> {
    const settings = await this.getSettingsOrThrow(userId);

    settings.jobPreferences = updateDto;

    return this.settingsRepository.save(settings);
  }
}
