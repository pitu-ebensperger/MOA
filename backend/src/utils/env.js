export function validateEnv() {
  const env = process.env;
  const isProd = (env.NODE_ENV || 'development') === 'production';

  const required = [
    // Database
    ['DB_HOST', env.DB_HOST],
    ['DB_USER', env.DB_USER],
    ['DB_PASSWORD', env.DB_PASSWORD],
    ['DB_DATABASE', env.DB_DATABASE],
    // Auth
    ['JWT_SECRET', env.JWT_SECRET],
  ];

  const missing = required.filter(([key, val]) => !val).map(([key]) => key);
  if (missing.length) {
    const msg = `Missing required environment variables: ${missing.join(', ')}`;
    throw new Error(msg);
  }

  if (isProd) {
    // In production, recommend CORS_ORIGIN to be set
    if (!env.CORS_ORIGIN && !env.CORS_ORIGINS) {
      // Non-fatal warning
      // eslint-disable-next-line no-console
      console.warn('[WARN] CORS_ORIGIN not set in production. Consider restricting allowed origins.');
    }
  }

  return true;
}
