export const FileTypeEnum = {
  AVATAR: 'avatar',
  RESUME: 'resume',
} as const;

export type FileType = (typeof FileTypeEnum)[keyof typeof FileTypeEnum];

export const FILE_VALIDATION_CONSTANTS = {
  [FileTypeEnum.AVATAR]: {
    MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] as const,
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'] as const,
  },
  [FileTypeEnum.RESUME]: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ['application/pdf'] as const,
    ALLOWED_EXTENSIONS: ['.pdf'] as const,
  },
} as const;
