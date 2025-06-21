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
});
