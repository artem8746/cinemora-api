import {
  AppearanceSettings,
  NotificationSettings,
  PersonalInfoSettings,
  AISettings,
  JobPreferencesSettings,
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

export const DEFAULT_PERSONAL_INFO_SETTINGS: PersonalInfoSettings = {
  targetRole: '',
  yearsOfExperience: '',
  locationPreferences: [],
  salaryExpectations: {
    min: 0,
    max: 0,
  },
  topSkills: [],
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  writingStyle: 'professional-balanced',
  coverLetterTone: 'enthusiastic-professional',
  resumeOptimization: 'aggressive',
  generatedContentLang: 'english',
};

export const DEFAULT_JOB_PREFERENCES_SETTINGS: JobPreferencesSettings = {
  workType: {
    fullTime: true,
    contract: false,
    partTime: false,
  },
  remote: {
    remoteOnly: true,
    hybridAcceptable: true,
    officeAcceptable: false,
  },
  companySize: {
    startup: true,
    midSize: true,
    enterprise: false,
  },
};
