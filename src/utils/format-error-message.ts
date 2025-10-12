import { ValidationError } from 'class-validator';

export function formatErrorMessage(errors: ValidationError[]): string {
  if (!errors || errors.length === 0) {
    return '';
  }

  return errors
    .map((error) => {
      const constraints = error.constraints
        ? Object.values(error.constraints).join('; ')
        : '';

      const childErrors =
        error.children && error.children.length > 0
          ? formatErrorMessage(error.children)
          : '';

      return `Property '${error.property}': ${constraints}${childErrors ? ` (${childErrors})` : ''}`;
    })
    .join('; ');
}
