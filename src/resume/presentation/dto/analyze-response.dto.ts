import { ApiProperty } from '@nestjs/swagger';
import {
  SocialLink,
  Section,
  WorkEntry,
  SkillEntry,
  ProfileEntry,
  ProjectEntry,
  EducationEntry,
  CustomEntry,
  ParsedResume,
} from '../types/resume';

class PersonalDetailsDto {
  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  phone: string;

  @ApiProperty({
    description: 'URL to the photo',
    example: 'https://example.com/photo.jpg',
  })
  photo: string;

  @ApiProperty({
    description: 'Social media links',
    type: Object,
  })
  social: { [key: string]: SocialLink };

  @ApiProperty({
    description: 'Address',
    example: '123 Main St, City, Country',
  })
  address: string;

  @ApiProperty({ description: 'Full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({ description: 'Job title', example: 'Software Engineer' })
  jobTitle: string;

  @ApiProperty({
    description: 'Order of personal details',
    type: [String],
    example: ['fullName', 'jobTitle', 'phone', 'email'],
  })
  detailsOrder: string[];

  @ApiProperty({
    description: 'Display email',
    example: 'john.doe@example.com',
  })
  displayEmail: string;
}

class ContentDto {
  @ApiProperty({ description: 'Work experience section' })
  work: Section<WorkEntry>;

  @ApiProperty({ description: 'Skills section' })
  skill: Section<SkillEntry>;

  @ApiProperty({ description: 'Profile section' })
  profile: Section<ProfileEntry>;

  @ApiProperty({ description: 'Projects section' })
  project: Section<ProjectEntry>;

  @ApiProperty({ description: 'Education section' })
  education: Section<EducationEntry>;

  [key: string]:
    | Section<WorkEntry>
    | Section<SkillEntry>
    | Section<ProfileEntry>
    | Section<ProjectEntry>
    | Section<EducationEntry>
    | Section<CustomEntry>;
}

export class AnalyzeResponseDto implements ParsedResume {
  @ApiProperty({
    description: 'Resume ID',
    example: 'uuid-1234-5678-9101',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'uuid-1234-5678-9101',
  })
  userId: string;

  @ApiProperty({
    description: 'Resume title',
    example: 'Software Engineer Resume',
  })
  title: string;

  @ApiProperty({
    description: 'Personal details',
    type: PersonalDetailsDto,
  })
  personalDetails: PersonalDetailsDto;

  @ApiProperty({
    description: 'Resume content sections',
    type: ContentDto,
  })
  content: ContentDto;

  constructor(partial: Partial<ParsedResume>) {
    Object.assign(this, partial);
  }
}
