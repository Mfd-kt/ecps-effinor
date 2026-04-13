/**
 * Logger centralisé pour remplacer console.log
 * En production, les logs de debug sont désactivés
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

class Logger {
  log(...args) {
    if (isDev) {
      console.log('[LOG]', ...args);
    }
  }

  info(...args) {
    if (isDev) {
      console.info('[INFO]', ...args);
    }
  }

  warn(...args) {
    console.warn('[WARN]', ...args);
  }

  error(...args) {
    console.error('[ERROR]', ...args);
  }

  debug(...args) {
    if (isDev) {
      console.debug('[DEBUG]', ...args);
    }
  }

  // Méthode spéciale pour les logs de lead (toujours actifs)
  lead(...args) {
    console.log('[LEAD]', ...args);
  }
}

export const logger = new Logger();
export default logger;

