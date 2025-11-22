import { cleanExpiredTokens } from '../models/passwordResetModel.js';

const MIN_INTERVAL_MINUTES = 5;
let cleanupTimer = null;

const shouldLogCleanup = () => process.env.PASSWORD_RESET_CLEANUP_LOGS === 'true';

const runCleanup = async () => {
  try {
    const deleted = await cleanExpiredTokens();
    if (shouldLogCleanup()) {
      console.info(`[PasswordResetCleanup] Tokens eliminados: ${deleted}`);
    }
  } catch (error) {
    if (shouldLogCleanup()) {
      console.error('[PasswordResetCleanup] Error limpiando tokens:', error);
    }
  }
};

export const startPasswordResetCleanupJob = () => {
  const enabled = (process.env.PASSWORD_RESET_CLEANUP_ENABLED ?? 'true') !== 'false';
  if (!enabled) {
    return;
  }

  const intervalMinutes = Number(process.env.PASSWORD_RESET_CLEANUP_INTERVAL_MINUTES || 60);
  const safeIntervalMinutes = Number.isFinite(intervalMinutes)
    ? Math.max(intervalMinutes, MIN_INTERVAL_MINUTES)
    : 60;
  const intervalMs = safeIntervalMinutes * 60 * 1000;

  // Ejecutar al iniciar
  runCleanup();

  cleanupTimer = setInterval(runCleanup, intervalMs);
};

export const stopPasswordResetCleanupJob = () => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
};
