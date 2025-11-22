import {
  IsBoolean,
  IsObject,
  ValidateNested,
  IsString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmailNotificationsDto {
  @IsBoolean()
  jobStatusUpdates: boolean;

  @IsBoolean()
  weeklyDigest: boolean;

  @IsBoolean()
  creditsLowWarning: boolean;

  @IsBoolean()
  marketingEmails: boolean;
}

class PushNotificationsDto {
  @IsBoolean()
  interviewReminders: boolean;

  @IsBoolean()
  dailyJobSuggestions: boolean;
}

class NotificationTimeDto {
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  start: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  end: string;
}

export class UpdateNotificationsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => EmailNotificationsDto)
  email: EmailNotificationsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PushNotificationsDto)
  push: PushNotificationsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => NotificationTimeDto)
  notificationTime: NotificationTimeDto;
}
