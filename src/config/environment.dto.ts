import { IsEnum, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class EnvironmentDto {
  @IsEnum(['development', 'production', 'test'])
  NODE_ENV!: 'development' | 'production' | 'test';

  @IsNumber()
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
  POSTGRES_PORT!: number;

  // ==========================================
  // Redis configuration
  // ==========================================
  @IsNumber()
  REDIS_PORT!: number;

  // ==========================================
  // Sendgrid configuration
  // ==========================================
  @IsString()
  @IsNotEmpty()
  SEND_GRID_API_KEY!: string;

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
  EXPIRES_ACCESS_TOKEN!: string;

  @IsString()
  EXPIRES_REFRESH_TOKEN!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_ACCESS!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_REFRESH!: string;

  @IsNumber()
  MAX_AGE_ACCESS_TOKEN!: number;

  @IsNumber()
  MAX_AGE_REFRESH_TOKEN!: number;

  @IsString()
  @IsNotEmpty()
  COOKIES_PATH!: string;

  @IsString()
  @IsNotEmpty()
  COOKIES_SECRET!: string;
}
