export function safeJsonParse<T>(value: string | null, fallback: T | null = null): T | null {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    // Do not include the input or parser error because either may contain user data.
    console.error('safeJsonParse failed to parse JSON.');
    return fallback;
  }
}
