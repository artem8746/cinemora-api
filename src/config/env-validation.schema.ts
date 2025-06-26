import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  ALLOWED_METHODS: Joi.string().required(),
  ALLOWED_ORIGINS: Joi.string().required(),
  ALLOWED_HEADERS: Joi.string().required(),
  // Database configuration
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  // Redis configuration
  REDIS_PORT: Joi.number().default(6379),
  // Email configuration
  SEND_GRID_API_KEY: Joi.string().required(),
});
