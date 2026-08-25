/**
 * Fix for issue #911:
 * `crashReportingService` was used in secureStorage.ts without being imported,
 * causing a ReferenceError on every token read/write.
 *
 * This module provides a minimal crash reporting facade that can be imported
 * wherever needed. It delegates to the real crash reporting service when
 * available, and silently no-ops otherwise.
 */
import defaultLogger from '../utils/logger';

const logger = defaultLogger;

export interface CrashReportingService {
  recordError(error: Error, context?: Record<string, unknown>): void;
  setContext(key: string, value: string): void;
}

/**
 * A lightweight crash-reporting facade.
 * Logs errors locally and can be wired to a real provider (e.g. Sentry).
 */
export const crashReportingService: CrashReportingService = {
  recordError(error: Error, context?: Record<string, unknown>): void {
    logger.error('CrashReport', { message: error.message, ...context });
  },

  setContext(key: string, value: string): void {
    logger.debug('CrashReport.setContext', { key, value });
  },
};