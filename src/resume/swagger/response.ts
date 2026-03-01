import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

const socialLinkSchema = {
  type: 'object',
  properties: {
    link: { type: 'string', example: 'https://github.com/user' },
    display: { type: 'string', example: 'github.com/user' },
    iconKey: { type: 'string', example: 'github' },
  },
  required: ['link', 'display', 'iconKey'],
};

const workEntrySchema = {
  type: 'object',
  properties: {
    employer: { type: 'string', example: 'Tech Corp' },
    isHidden: { type: 'boolean', example: false },
    jobTitle: { type: 'string', example: 'Software Engineer' },
    location: { type: 'string', example: 'San Francisco, CA' },
    endDateNew: { type: 'string', example: '2024-12' },
    description: {
      type: 'string',
      example: '<ul><li>Developed features</li></ul>',
    },
    employerLink: { type: 'string', example: 'https://techcorp.com' },
    startDateNew: { type: 'string', example: '2022-01' },
  },
  required: [
    'employer',
    'isHidden',
    'jobTitle',
    'location',
    'endDateNew',
    'description',
    'employerLink',
    'startDateNew',
  ],
};

const skillEntrySchema = {
  type: 'object',
  properties: {
    skill: { type: 'string', example: 'TypeScript' },
    infoHtml: { type: 'string', example: '<p>Advanced level</p>' },
    isHidden: { type: 'boolean', example: false },
  },
  required: ['skill', 'infoHtml', 'isHidden'],
};

const profileEntrySchema = {
  type: 'object',
  properties: {
    text: { type: 'string', example: 'Experienced software engineer...' },
    isHidden: { type: 'boolean', example: false },
  },
  required: ['text', 'isHidden'],
};

const projectEntrySchema = {
  type: 'object',
  properties: {
    isHidden: { type: 'boolean', example: false },
    subTitle: { type: 'string', example: 'Full Stack Application' },
    endDateNew: { type: 'string', example: '2024-06' },
    description: {
      type: 'string',
      example: '<ul><li>Built with React</li></ul>',
    },
    projectTitle: { type: 'string', example: 'E-commerce Platform' },
    startDateNew: { type: 'string', example: '2023-01' },
    projectTitleLink: {
      type: 'string',
      example: 'https://github.com/user/project',
    },
  },
  required: [
    'isHidden',
    'subTitle',
    'endDateNew',
    'description',
    'projectTitle',
    'startDateNew',
    'projectTitleLink',
  ],
};

const educationEntrySchema = {
  type: 'object',
  properties: {
    degree: { type: 'string', example: 'Bachelor of Science' },
    school: { type: 'string', example: 'University of Technology' },
    isHidden: { type: 'boolean', example: false },
    location: { type: 'string', example: 'New York, NY' },
    endDateNew: { type: 'string', example: '2020-05' },
    schoolLink: { type: 'string', example: 'https://university.edu' },
    description: { type: 'string', example: 'Computer Science' },
    startDateNew: { type: 'string', example: '2016-09' },
  },
  required: [
    'degree',
    'school',
    'isHidden',
    'location',
    'endDateNew',
    'schoolLink',
    'description',
    'startDateNew',
  ],
};

const customEntrySchema = {
  type: 'object',
  properties: {
    title: { type: 'string', example: 'Certification' },
    titleLink: { type: 'string', example: 'https://example.com' },
    isHidden: { type: 'boolean', example: false },
    location: { type: 'string', example: 'Online' },
    subTitle: { type: 'string', example: 'AWS Certified' },
    endDateNew: { type: 'string', example: '2024-01' },
    description: {
      type: 'string',
      example: '<ul><li>Cloud architecture</li></ul>',
    },
    startDateNew: { type: 'string', example: '2023-06' },
    icon: { type: 'string', example: 'certificate' },
  },
  required: [
    'title',
    'titleLink',
    'isHidden',
    'location',
    'subTitle',
    'endDateNew',
    'description',
    'startDateNew',
    'icon',
  ],
};

const sectionSchema = (entrySchema: Record<string, unknown>) => ({
  type: 'object',
  properties: {
    entries: {
      type: 'array',
      items: entrySchema,
    },
    iconKey: { type: 'string', example: 'work' },
    displayName: { type: 'string', example: 'Work Experience' },
    sectionType: { type: 'string', example: 'work' },
  },
  required: ['entries', 'iconKey', 'displayName', 'sectionType'],
});

const personalDetailsSchema = {
  type: 'object',
  properties: {
    phone: { type: 'string', example: '+1234567890' },
    photo: { type: 'string', example: 'https://example.com/photo.jpg' },
    social: {
      type: 'object',
      additionalProperties: socialLinkSchema,
    },
    address: { type: 'string', example: '123 Main St, City, Country' },
    fullName: { type: 'string', example: 'John Doe' },
    jobTitle: { type: 'string', example: 'Software Engineer' },
    detailsOrder: {
      type: 'array',
      items: { type: 'string' },
      example: ['fullName', 'jobTitle', 'phone'],
    },
    displayEmail: { type: 'string', example: 'john.doe@example.com' },
  },
  required: [
    'phone',
    'photo',
    'social',
    'address',
    'fullName',
    'jobTitle',
    'detailsOrder',
    'displayEmail',
  ],
};

const contentSchema = {
  type: 'object',
  properties: {
    work: sectionSchema(workEntrySchema),
    skill: sectionSchema(skillEntrySchema),
    profile: sectionSchema(profileEntrySchema),
    project: sectionSchema(projectEntrySchema),
    education: sectionSchema(educationEntrySchema),
  },
  required: ['work', 'skill', 'profile', 'project', 'education'],
  additionalProperties: sectionSchema(customEntrySchema),
};

const customizationSchema = {
  type: 'object',
  properties: {
    sectionOrder: {
      type: 'array',
      items: { type: 'string' },
      example: ['profile', 'work', 'project', 'education', 'skill'],
    },
  },
  required: ['sectionOrder'],
};

const parsedResumeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', example: 'uuid-1234-5678-9101' },
    userId: { type: 'string', example: 'uuid-1234-5678-9101' },
    title: { type: 'string', example: 'John Doe - Software Engineer' },
    personalDetails: personalDetailsSchema,
    content: contentSchema,
    customization: customizationSchema,
  },
  required: [
    'id',
    'userId',
    'title',
    'personalDetails',
    'content',
    'customization',
  ],
};

const keySkillMatchSchema = {
  type: 'object',
  properties: {
    skill: { type: 'string', example: 'React' },
    status: {
      type: 'string',
      enum: ['match', 'partial', 'missing'],
      example: 'match',
    },
    message: { type: 'string', example: 'You have it' },
  },
  required: ['skill', 'status', 'message'],
};

const aiInsightsSchema = {
  type: 'object',
  properties: {
    atsScore: { type: 'number', example: 85, minimum: 0, maximum: 100 },
    keywordMatch: { type: 'number', example: 75, minimum: 0, maximum: 100 },
    experienceMatch: {
      type: 'number',
      example: 80,
      minimum: 0,
      maximum: 100,
    },
  },
  required: ['atsScore', 'keywordMatch', 'experienceMatch'],
};

const resumeMatchResponseSchema = {
  type: 'object',
  properties: {
    keySkillsMatch: {
      type: 'array',
      items: keySkillMatchSchema,
      example: [
        {
          skill: 'React',
          status: 'match',
          message: 'You have it',
        },
        {
          skill: 'TypeScript',
          status: 'match',
          message: 'You have it',
        },
        {
          skill: 'System Design',
          status: 'partial',
          message: 'Partial match',
        },
        {
          skill: 'GraphQL',
          status: 'missing',
          message: 'Missing - add to resume!',
        },
      ],
    },
    matchScore: { type: 'number', example: 78, minimum: 0, maximum: 100 },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      example: [
        'Your React experience aligns well',
        'Leadership background fits',
      ],
    },
    toImprove: {
      type: 'array',
      items: { type: 'string' },
      example: ['Add GraphQL projects', 'Highlight system design examples'],
    },
    aiInsights: aiInsightsSchema,
  },
  required: [
    'keySkillsMatch',
    'matchScore',
    'strengths',
    'toImprove',
    'aiInsights',
  ],
};

export const ResumeResponses = {
  AnalyzeSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume analyzed successfully',
    schema: parsedResumeSchema,
  }),

  AnalyzeBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file (size or type)',
  }),

  CompareSuccess: ApiResponse({
    status: HttpStatus.OK,
    description: 'Resume compared with vacancy successfully',
    schema: resumeMatchResponseSchema,
  }),

  CompareBadRequest: ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data or vacancy not found',
  }),
};
