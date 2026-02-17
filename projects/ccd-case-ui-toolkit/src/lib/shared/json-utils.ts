export function safeJsonParse<T>(value: string | null, fallback: T | null = null): T | null {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
