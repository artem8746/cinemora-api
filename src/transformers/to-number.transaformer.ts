import { Transform, TransformOptions } from 'class-transformer';

export function ToNumber(
  options?: TransformOptions,
  defaultValue?: number,
): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsedValue = Number(value);

      return Number.isNaN(parsedValue) ? defaultValue : parsedValue;
    }

    return defaultValue ?? NaN;
  }, options);
}
