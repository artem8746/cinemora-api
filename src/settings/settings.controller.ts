import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { CommonResponses } from '@/utils/swagger.decorator';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { UpdateAISettingsDto } from './dto/update-ai-settings.dto';
import { UpdateJobPreferencesDto } from './dto/update-job-preferences.dto';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public getSettings(@CurrentUserId() userId: string) {
    return this.settingsService.getSettingsOrCreateDefault(userId);
  }

  @Put('appearance')
  @ApiOperation({ summary: 'Replace appearance settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updateAppearance(
    @CurrentUserId() userId: string,
    @Body() updateAppearanceDto: UpdateAppearanceDto,
  ) {
    return this.settingsService.updateAppearance(userId, updateAppearanceDto);
  }

  @Put('notifications')
  @ApiOperation({ summary: 'Replace notification settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updateNotifications(
    @CurrentUserId() userId: string,
    @Body() updateNotificationsDto: UpdateNotificationsDto,
  ) {
    return this.settingsService.updateNotifications(
      userId,
      updateNotificationsDto,
    );
  }

  @Put('personal-info')
  @ApiOperation({ summary: 'Replace personal info settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updatePersonalInfo(
    @CurrentUserId() userId: string,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    return this.settingsService.updatePersonalInfo(
      userId,
      updatePersonalInfoDto,
    );
  }

  @Put('ai-settings')
  @ApiOperation({ summary: 'Replace AI settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updateAISettings(
    @CurrentUserId() userId: string,
    @Body() updateAISettingsDto: UpdateAISettingsDto,
  ) {
    return this.settingsService.updateAISettings(userId, updateAISettingsDto);
  }

  @Put('job-preferences')
  @ApiOperation({ summary: 'Replace job preferences settings' })
  @CommonResponses.ApiResponseBadRequest
  @CommonResponses.ApiResponseSuccess
  public updateJobPreferences(
    @CurrentUserId() userId: string,
    @Body() updateJobPreferencesDto: UpdateJobPreferencesDto,
  ) {
    return this.settingsService.updateJobPreferences(
      userId,
      updateJobPreferencesDto,
    );
  }
}
