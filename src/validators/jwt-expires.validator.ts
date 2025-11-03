import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Validates JWT expires format (e.g., "15m", "1h", "7d", "30d")
 * Supports: seconds (s), minutes (m), hours (h), days (d)
 */
@ValidatorConstraint({ name: 'isJwtExpiresFormat', async: false })
export class IsJwtExpiresFormat implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Match format: number followed by s, m, h, or d
    // Examples: "15s", "30m", "1h", "7d", "24h", "365d"
    const jwtExpiresPattern = /^\d+[smhd]$/i;

    return jwtExpiresPattern.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a string in JWT expires format (e.g., "15m", "1h", "7d"). Format: number followed by s (seconds), m (minutes), h (hours), or d (days)`;
  }
}
