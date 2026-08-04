import { StructuredLoggerService } from './services/logging';

const logger = new StructuredLoggerService();

export function safeJsonParse<T>(value: string | null, fallback: T | null = null): T | null {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    // Log for diagnostics, then return fallback to avoid UI crashes.
    logger.error('safeJsonParse failed to parse JSON.', { error });
    return fallback;
  }
}
