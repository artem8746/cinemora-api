export interface ResumeRawContent {
  text: string;
  links: string[];
}

export interface ParsedResume {
  id: string;
  userId: string;
  title: string;

  personalDetails: {
    phone: string;
    photo: string; // URL to the photo
    social: {
      // github?: SocialLink;
      // linkedIn?: SocialLink;
      // telegram?: SocialLink;
      // website?: SocialLink;
      // email?: SocialLink;
      [key: string]: SocialLink;
      // NO USE CREATING ENUM ON BACKEND, CREATE ON FRONTEND
    };
    address: string;
    fullName: string;
    jobTitle: string;
    detailsOrder: string[];
    displayEmail: string;
  };

  content: {
    work: Section<WorkEntry>;
    skill: Section<SkillEntry>;
    profile: Section<ProfileEntry>;
    project: Section<ProjectEntry>;
    education: Section<EducationEntry>;
    [key: string]:
      | Section<WorkEntry> // FOR THESE CUSTOM NAMES ABOVE
      | Section<SkillEntry> // FOR THESE CUSTOM NAMES ABOVE
      | Section<ProfileEntry> // FOR THESE CUSTOM NAMES ABOVE
      | Section<ProjectEntry> // FOR THESE CUSTOM NAMES ABOVE
      | Section<EducationEntry> // FOR THESE CUSTOM NAMES ABOVE
      | Section<CustomEntry>; // KEY - HEADING
  };
}

// NO NEED FOR ID FIELD, ALL KEYS ARE UNIQUE

export interface SocialLink {
  link: string;
  display: string;
  iconKey: string;
}

export interface Section<T> {
  entries: T[];
  iconKey: string;
  displayName: string;
  sectionType: string;
}

/* -------------------------
   SECTION ENTRY TYPES
-------------------------- */

export interface WorkEntry {
  employer: string;
  isHidden: boolean;
  jobTitle: string;
  location: string;
  endDateNew: string;
  description: string; // HTML string
  employerLink: string;
  startDateNew: string;
}

export interface SkillEntry {
  skill: string;
  infoHtml: string;
  isHidden: boolean;
}

export interface CustomEntry {
  title: string;
  titleLink: string;
  isHidden: boolean;
  location: string;
  subTitle: string;
  endDateNew: string;
  description: string;
  startDateNew: string;
  icon: string;
}

export interface ProfileEntry {
  text: string;
  isHidden: boolean;
}

export interface ProjectEntry {
  isHidden: boolean;
  subTitle: string;
  endDateNew: string;
  description: string; // HTML
  projectTitle: string;
  startDateNew: string;
  projectTitleLink: string;
}

export interface EducationEntry {
  degree: string;
  school: string;
  isHidden: boolean;
  location: string;
  endDateNew: string;
  schoolLink: string;
  description: string;
  startDateNew: string;
}
