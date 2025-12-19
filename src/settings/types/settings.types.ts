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

export interface PersonalInfoSettings {
  targetRole: string;
  yearsOfExperience: string;
  locationPreferences: string[];
  salaryExpectations: {
    min: number;
    max: number;
  };
  topSkills: string[];
}

export interface AISettings {
  writingStyle: 'professional-balanced' | 'creative';
  coverLetterTone: 'enthusiastic-professional' | 'friendly';
  resumeOptimization: 'aggressive' | 'conservative';
  generatedContentLang: 'english' | 'ukrainian';
}

export interface JobPreferencesSettings {
  workType: {
    fullTime: boolean;
    contract: boolean;
    partTime: boolean;
  };
  remote: {
    remoteOnly: boolean;
    hybridAcceptable: boolean;
    officeAcceptable: boolean;
  };
  companySize: {
    startup: boolean;
    midSize: boolean;
    enterprise: boolean;
  };
}
