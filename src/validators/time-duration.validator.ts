import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

/**
 * Validates time duration format (e.g., "15m", "1h", "7d", "30d")
 * Supports: seconds (s), minutes (m), hours (h), days (d)
 */
@ValidatorConstraint({ name: 'isTimeDurationFormat', async: false })
export class IsTimeDurationFormat implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') {
      return false;
    }

    // Match format: number followed by s, m, h, or d
    // Examples: "15s", "30m", "1h", "7d", "24h", "365d"
    const timeDurationPattern = /^\d+[smhd]$/i;

    return timeDurationPattern.test(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a string in time duration format (e.g., "15m", "1h", "7d"). Format: number followed by s (seconds), m (minutes), h (hours), or d (days)`;
  }
}

/**
 * Decorator to validate time duration format
 * @param validationOptions - Optional validation options
 * @example
 * ```ts
 * class MyDto {
 *   @IsTimeDuration()
 *   expiresIn: string; // "15m", "1h", "7d"
 * }
 * ```
 */
export function IsTimeDuration(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: object, propertyName: string | symbol): void {
    registerDecorator({
      name: 'isTimeDurationFormat',
      target: object.constructor,
      propertyName: propertyName as string,
      options: validationOptions,
      validator: IsTimeDurationFormat,
    });
  };
}
