export interface AppearanceSettings {
  theme: 'light' | 'dark';
  language: string;
  dateFormat: string;
  timezone: string;
}

export interface NotificationSettings {
  email: {
    jobStatusUpdates: boolean;
    weeklyDigest: boolean;
    creditsLowWarning: boolean;
    marketingEmails: boolean;
  };
  push: {
    interviewReminders: boolean;
    dailyJobSuggestions: boolean;
  };
  notificationTime: {
    start: string;
    end: string;
  };
}
