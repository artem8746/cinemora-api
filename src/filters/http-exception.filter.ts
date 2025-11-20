import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SentryExceptionCaptured } from '@sentry/nestjs';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PinoLogger } from 'nestjs-pino';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger: PinoLogger;

  constructor() {
    this.logger = new PinoLogger({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      },
    });
    this.logger.setContext(HttpExceptionFilter.name); // optional context tag
  }

  @SentryExceptionCaptured()
  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      if (statusCode >= 500) {
        // Add sentry error logging here if needed
      }
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();
      let error = errorResponse !== undefined ? errorResponse : '';

      if (typeof errorResponse === 'object') {
        if ('error' in errorResponse && 'message' in errorResponse) {
          const objectErrorResponse = errorResponse as {
            message: string;
          };

          const message = Array.isArray(objectErrorResponse.message)
            ? (objectErrorResponse.message[0] as string)
            : objectErrorResponse.message;

          error = {
            message,
          };
        } else if ('error' in errorResponse) {
          const objectErrorResponse = errorResponse as {
            error: Record<string, string>;
          };
          error = objectErrorResponse.error;
        } else if ('message' in errorResponse) {
          const objectErrorResponse = errorResponse as Record<string, unknown>;

          error = {
            message: objectErrorResponse.message,
          };

          Object.keys(objectErrorResponse).forEach((key) => {
            if (key !== 'message' && key !== 'statusCode') {
              error[key] = objectErrorResponse[key];
            }
          });
        }
      }

      response.status(status).send({
        error,
        status: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        data: exception.stack,
      });
    } else {
      this.logger.error(exception.message ?? 'Unknown error');

      response.status(HttpStatus.BAD_REQUEST).send({
        status: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: request.url,
        error: 'Unknown error',
        data: exception.stack,
      });
    }
  }
}
