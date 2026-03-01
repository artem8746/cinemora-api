import { randomUUID } from 'crypto';
import { ResumeParsedContent } from '@/openai/types/resume';
import {
  ParsedResume,
  Section,
  SocialLink,
  WorkEntry,
  SkillEntry,
  ProfileEntry,
  ProjectEntry,
  EducationEntry,
  Customization,
} from '@/resume/presentation/types/resume';

export const SOCIAL_LINK_ICON_KEYS = {
  linkedin: 'linkedin',
  github: 'github',
  telegram: 'telegram',
  email: 'email',
} as const;

export const SOCIAL_LINK_ICON_KEYS_MAP = {
  [SOCIAL_LINK_ICON_KEYS.linkedin]: 'linkedin',
  [SOCIAL_LINK_ICON_KEYS.github]: 'github',
  [SOCIAL_LINK_ICON_KEYS.telegram]: 'telegram',
  [SOCIAL_LINK_ICON_KEYS.email]: 'email',
} as const;

export class ResumeContentMapper {
  static toParsedResume(
    content: ResumeParsedContent,
    customization: Customization,
    userId: string,
  ): ParsedResume {
    return {
      id: randomUUID(),
      userId,
      title: content.title,
      personalDetails: {
        phone: content.personalDetails.phone,
        photo: content.personalDetails.photo,
        social: this.mapSocialLinks(content.personalDetails.social),
        address: content.personalDetails.address,
        fullName: content.personalDetails.fullName,
        jobTitle: content.personalDetails.jobTitle,
        detailsOrder: this.getDefaultDetailsOrder(),
        displayEmail: '',
      },
      content: {
        work: this.mapWorkSection(content.content.work),
        skill: this.mapSkillSection(content.content.skill),
        profile: this.mapProfileSection(content.content.profile),
        project: this.mapProjectSection(content.content.project),
        education: this.mapEducationSection(content.content.education),
      },
      customization,
    };
  }

  private static mapSocialLinks(social: { [platform: string]: string }): {
    [key: string]: SocialLink;
  } {
    const mapped: { [key: string]: SocialLink } = {};

    for (const [platform, url] of Object.entries(social)) {
      mapped[platform] = {
        link: url,
        display:
          SOCIAL_LINK_ICON_KEYS_MAP[
            platform as keyof typeof SOCIAL_LINK_ICON_KEYS
          ],
        iconKey:
          SOCIAL_LINK_ICON_KEYS[platform as keyof typeof SOCIAL_LINK_ICON_KEYS],
      };
    }

    return mapped;
  }

  private static getDefaultDetailsOrder(): string[] {
    return ['fullName', 'jobTitle', 'phone', 'address', 'social'];
  }

  private static mapWorkSection(
    work: ResumeParsedContent['content']['work'],
  ): Section<WorkEntry> {
    return {
      entries: work.entries.map((entry) => ({
        employer: entry.employer,
        isHidden: false,
        jobTitle: entry.jobTitle,
        location: entry.location,
        endDateNew: entry.endDateNew,
        description: entry.description,
        employerLink: entry.employerLink,
        startDateNew: entry.startDateNew,
      })),
      iconKey: 'work',
      displayName: 'Experience',
      sectionType: 'work',
    };
  }

  private static mapSkillSection(
    skill: ResumeParsedContent['content']['skill'],
  ): Section<SkillEntry> {
    return {
      entries: skill.entries.map((skillName) => ({
        skill: skillName,
        infoHtml: '',
        isHidden: false,
      })),
      iconKey: 'skill',
      displayName: 'Skills',
      sectionType: 'skill',
    };
  }

  private static mapProfileSection(profile: string): Section<ProfileEntry> {
    return {
      entries: [
        {
          text: profile,
          isHidden: false,
        },
      ],
      iconKey: 'profile',
      displayName: 'Profile',
      sectionType: 'profile',
    };
  }

  private static mapProjectSection(
    project: ResumeParsedContent['content']['project'],
  ): Section<ProjectEntry> {
    return {
      entries: project.entries.map((entry) => ({
        isHidden: false,
        subTitle: entry.subTitle,
        endDateNew: entry.endDateNew,
        description: entry.description,
        projectTitle: entry.projectTitle,
        startDateNew: entry.startDateNew,
        projectTitleLink: entry.projectTitleLink,
      })),
      iconKey: 'project',
      displayName: 'Projects',
      sectionType: 'project',
    };
  }

  private static mapEducationSection(
    education: ResumeParsedContent['content']['education'],
  ): Section<EducationEntry> {
    return {
      entries: education.entries.map((entry) => ({
        degree: entry.degree,
        school: entry.school,
        isHidden: false,
        location: entry.location,
        endDateNew: entry.endDateNew,
        schoolLink: entry.schoolLink,
        description: entry.description,
        startDateNew: entry.startDateNew,
      })),
      iconKey: 'education',
      displayName: 'Education',
      sectionType: 'education',
    };
  }
}
