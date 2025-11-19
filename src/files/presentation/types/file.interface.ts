/**
 * Common file interface for Fastify multipart file uploads
 * Compatible with NestJS FileInterceptor from @nestjs/platform-fastify
 */
export interface UploadedFile {
  fieldname: string;
  filename: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
