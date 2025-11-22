import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateAppearanceDto } from './dto/update-appearance.dto';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { AccessTokenGuard } from '@/common/guards/jwt-auth.guard';
import { CommonResponses } from '@/utils/swagger.decorator';
import { CurrentUserId } from '@/common/decorators/current-user-id.decorator';

@ApiTags('settings')
@Controller('settings')
@UseGuards(AccessTokenGuard)
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
}
