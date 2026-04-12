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

export const parsedResumeSchema = {
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

export const parsedResumeDataSchema = {
  type: 'object',
  description:
    'Resume content (personalDetails, content sections, customization)',
  properties: {
    personalDetails: personalDetailsSchema,
    content: contentSchema,
    customization: customizationSchema,
  },
  required: ['personalDetails', 'content', 'customization'],
};
