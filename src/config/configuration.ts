import { EnvironmentDto } from './environment.dto';

function getCorsConfig(env: EnvironmentDto) {
  return {
    allowedOrigins: env.ALLOWED_ORIGINS,
    allowedHeaders: env.ALLOWED_HEADERS,
    allowedMethods: env.ALLOWED_METHODS,
  } as const;
}

function getAuthConfig(env: EnvironmentDto) {
  return {
    maxAgeAccessToken: env.MAX_AGE_ACCESS_TOKEN ?? 86400000,
    maxAgeRefreshToken: env.MAX_AGE_REFRESH_TOKEN ?? 1728000000,
    jwtSecretAccess: env.JWT_SECRET_ACCESS,
    jwtSecretRefresh: env.JWT_SECRET_REFRESH,
    jwtSecretResetPassword: env.JWT_SECRET_RESET,
    jwtSecretActivation: env.JWT_SECRET_ACTIVATION,
    expiresAccessToken: env.EXPIRES_ACCESS_TOKEN,
    expiresRefreshToken: env.EXPIRES_REFRESH_TOKEN,
    expiresResetPassword: env.EXPIRES_RESET_TOKEN,
    expiresActivationToken: env.EXPIRES_ACTIVATION_TOKEN,
    googleClientId: env.GOOGLE_CLIENT_ID,
    googleClientSecret: env.GOOGLE_CLIENT_SECRET,
    googleCallbackUrl: env.GOOGLE_CALLBACK_URL,
    githubClientId: env.GITHUB_CLIENT_ID,
    githubClientSecret: env.GITHUB_CLIENT_SECRET,
    githubCallbackUrl: env.GITHUB_CALLBACK_URL,
  } as const;
}

function getEmailConfig(env: EnvironmentDto) {
  return {
    emailUser: env.EMAIL_USER,
  } as const;
}

function getAppConfig(env: EnvironmentDto) {
  return {
    domain: env.DOMAIN,
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    cookiesPath: env.COOKIES_PATH,
    cookiesSecret: env.COOKIES_SECRET,
    frontendUrl: env.FRONTEND_URL || 'http://localhost:3000',
    isDevelopment: env.NODE_ENV === 'development',
    isProduction: env.NODE_ENV === 'production',
  } as const;
}

export function configuration(env: EnvironmentDto) {
  return {
    cors: getCorsConfig(env),
    auth: getAuthConfig(env),
    email: getEmailConfig(env),
    app: getAppConfig(env),
  } as const;
}
