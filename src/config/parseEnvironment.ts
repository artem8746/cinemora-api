import { formatErrorMessage } from '@/utils/format-error-message';
import * as Sentry from '@sentry/node';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentDto } from './environment.dto';
import { InternalServerErrorException, Logger } from '@nestjs/common';

const logger = new Logger('Environment');

export function parseEnvironment(
  environmentData: Record<string, unknown>,
): EnvironmentDto {
  const validatedConfig = plainToInstance(EnvironmentDto, environmentData);

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessage = formatErrorMessage(errors);

    const exception = new InternalServerErrorException(
      `Environment validation failed: ${errorMessage}`,
    );

    logger.error(`Environment validation failed: ${errorMessage}`);
    Sentry.captureException(exception);

    process.exit(1);
  }

  return validatedConfig;
}
