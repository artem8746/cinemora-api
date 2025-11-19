export const FILE_VALIDATION_CONSTANTS = {
  AVATAR: {
    MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2MB
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/jpg'] as const,
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'] as const,
  },
  RESUME: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ['application/pdf'] as const,
    ALLOWED_EXTENSIONS: ['.pdf'] as const,
  },
} as const;

export type FileType = 'avatar' | 'resume';
