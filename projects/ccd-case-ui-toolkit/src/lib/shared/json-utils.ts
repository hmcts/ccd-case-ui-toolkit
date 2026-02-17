export function safeJsonParse<T>(value: string | null, fallback: T | null = null): T | null {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    // Log for diagnostics, then rethrow to surface unexpected corruption.
    // eslint-disable-next-line no-console
    console.error('safeJsonParse failed to parse JSON', error);
    throw error;
  }
}

export function safeJsonParseFallback<T>(value: string | null, fallback: T | null = null): T | null {
  try {
    return safeJsonParse(value, fallback);
  } catch {
    return fallback;
  }
}
