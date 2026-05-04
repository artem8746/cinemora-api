import { ToNumber } from '@/transformers/to-number.transaformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { IsTimeDuration } from '@/validators/time-duration.validator';

export class EnvironmentDto {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV!: 'development' | 'production' | 'test';

  @IsNumber()
  @ToNumber()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  ALLOWED_METHODS!: string;

  @IsString()
  @IsNotEmpty()
  ALLOWED_ORIGINS!: string;

  @IsString()
  @IsNotEmpty()
  ALLOWED_HEADERS!: string;

  @IsString()
  @IsNotEmpty()
  DOMAIN!: string;

  // ==========================================
  // Database configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  POSTGRES_USER!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DB!: string;

  @IsString()
  POSTGRES_HOST!: string;

  @IsNumber()
  @ToNumber()
  POSTGRES_PORT!: number;

  // ==========================================
  // Redis configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  REDIS_HOST!: string;

  @IsNumber()
  @ToNumber()
  REDIS_PORT!: number;

  // ==========================================
  // Mailjet configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  MAILJET_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  MAILJET_SECRET_KEY!: string;

  // ==========================================
  // Email configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  EMAIL_USER!: string;

  // ==========================================
  // JWT configuration
  // ==========================================
  @IsString()
  @IsTimeDuration()
  EXPIRES_ACCESS_TOKEN!: string;

  @IsString()
  @IsTimeDuration()
  EXPIRES_REFRESH_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_ACCESS!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_REFRESH!: string;

  @IsNumber()
  @ToNumber()
  MAX_AGE_ACCESS_TOKEN!: number;

  @IsNumber()
  @ToNumber()
  MAX_AGE_REFRESH_TOKEN!: number;

  @IsString()
  @IsNotEmpty()
  COOKIES_PATH!: string;

  @IsString()
  @IsNotEmpty()
  COOKIES_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_RESET!: string;

  @IsString()
  @IsNotEmpty()
  @IsTimeDuration()
  EXPIRES_RESET_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_ACTIVATION!: string;

  @IsString()
  @IsNotEmpty()
  @IsTimeDuration()
  EXPIRES_ACTIVATION_TOKEN!: string;

  // ==========================================
  // Frontend configuration
  // ==========================================
  @IsString()
  FRONTEND_URL?: string;
  // ==========================================
  // Google configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL!: string;

  // ==========================================
  // OpenAI configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY!: string;

  // ==========================================
  // Jina AI configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  JINA_API_URL!: string;

  // Github configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_ID!: string;

  @IsString()
  @IsNotEmpty()
  GITHUB_CLIENT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  GITHUB_CALLBACK_URL!: string;

  // ==========================================
  // Cloudflare R2 configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  R2_ACCOUNT_ID!: string;

  @IsString()
  @IsNotEmpty()
  R2_ACCESS_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  R2_SECRET_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  R2_PUBLIC_BUCKET_NAME!: string;

  @IsString()
  @IsNotEmpty()
  R2_PRIVATE_BUCKET_NAME!: string;

  @IsString()
  @IsNotEmpty()
  R2_PUBLIC_URL!: string;

  // ==========================================
  // Plata by Mono payment configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  PLATA_API_TOKEN!: string;

  @IsOptional()
  @IsString()
  PLATA_API_BASE_URL?: string;

  /** Full URL Plata redirects the user to after payment (defaults to FRONTEND_URL/payment/success). */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  PAYMENT_SUCCESS_REDIRECT_URL?: string;

  /** Public HTTPS URL for Plata webhooks (defaults to DOMAIN + /api/payments/webhook/plata). */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  PAYMENT_WEBHOOK_PUBLIC_URL?: string;
}
