const socialLinkSchema = {
  type: 'object',
  properties: {
    link: { type: 'string' },
    display: { type: 'string' },
    iconKey: { type: 'string' },
  },
  additionalProperties: false,
};

const profileEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    text: { type: 'string' },
    isHidden: { type: 'boolean' },
  },
  additionalProperties: false,
};

const workEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    employer: { type: 'string' },
    isHidden: { type: 'boolean' },
    jobTitle: { type: 'string' },
    location: { type: 'string' },
    endDate: { type: 'string' },
    description: { type: 'string' },
    employerLink: { type: 'string' },
    startDate: { type: 'string' },
  },
  additionalProperties: false,
};

const skillEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    skill: { type: 'string' },
    description: { type: 'string' },
    isHidden: { type: 'boolean' },
  },
  additionalProperties: false,
};

const projectEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    isHidden: { type: 'boolean' },
    subTitle: { type: 'string' },
    endDate: { type: 'string' },
    description: { type: 'string' },
    projectTitle: { type: 'string' },
    startDate: { type: 'string' },
    projectTitleLink: { type: 'string' },
  },
  additionalProperties: false,
};

const educationEntrySchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    degree: { type: 'string' },
    school: { type: 'string' },
    isHidden: { type: 'boolean' },
    location: { type: 'string' },
    endDate: { type: 'string' },
    schoolLink: { type: 'string' },
    description: { type: 'string' },
    startDate: { type: 'string' },
  },
  additionalProperties: false,
};

export const keySkillMatchSchema = {
  type: 'object',
  properties: {
    skill: { type: 'string' },
    status: { type: 'string', enum: ['match', 'partial', 'missing'] },
    message: { type: 'string' },
  },
  required: ['skill', 'status', 'message'],
  additionalProperties: false,
} as const;

export const keySkillsMatchSchema = {
  type: 'array',
  items: keySkillMatchSchema,
} as const;

export const suggestedContentPatchSchema = {
  type: 'object',
  properties: {
    personalDetails: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        photo: { type: 'string' },
        social: {
          type: 'object',
          properties: {
            github: socialLinkSchema,
            linkedIn: socialLinkSchema,
            telegram: socialLinkSchema,
            website: socialLinkSchema,
            email: socialLinkSchema,
          },
          additionalProperties: false,
        },
        address: { type: 'string' },
        fullName: { type: 'string' },
        jobTitle: { type: 'string' },
        detailsOrder: { type: 'array', items: { type: 'string' } },
        displayEmail: { type: 'string' },
      },
      additionalProperties: false,
    },
    content: {
      type: 'object',
      properties: {
        profile: {
          type: 'object',
          properties: {
            entries: { type: 'array', items: profileEntrySchema },
          },
          additionalProperties: false,
        },
        work: {
          type: 'object',
          properties: {
            entries: { type: 'array', items: workEntrySchema },
          },
          additionalProperties: false,
        },
        skill: {
          type: 'object',
          properties: {
            entries: { type: 'array', items: skillEntrySchema },
          },
          additionalProperties: false,
        },
        project: {
          type: 'object',
          properties: {
            entries: { type: 'array', items: projectEntrySchema },
          },
          additionalProperties: false,
        },
        education: {
          type: 'object',
          properties: {
            entries: { type: 'array', items: educationEntrySchema },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    customization: {
      type: 'object',
      properties: {
        sectionOrder: {
          type: 'array',
          items: { type: 'string' },
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
} as const;

export const sectionChangeSummarySchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    entryChanges: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          entryId: { type: 'string' },
          description: { type: 'string' },
          atsScoreImpact: { type: 'number' },
          matchScoreImpact: { type: 'number' },
        },
        required: [
          'entryId',
          'description',
          'atsScoreImpact',
          'matchScoreImpact',
        ],
        additionalProperties: false,
      },
    },
  },
  required: ['summary'],
  additionalProperties: false,
} as const;
