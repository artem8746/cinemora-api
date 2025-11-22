import {
  AppearanceSettings,
  NotificationSettings,
} from '../types/settings.types';

export const DEFAULT_APPEARANCE_SETTINGS: AppearanceSettings = {
  theme: 'light',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'UTC',
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  email: {
    jobStatusUpdates: true,
    weeklyDigest: false,
    creditsLowWarning: true,
    marketingEmails: false,
  },
  push: {
    interviewReminders: true,
    dailyJobSuggestions: false,
  },
  notificationTime: {
    start: '09:00',
    end: '18:00',
  },
};
