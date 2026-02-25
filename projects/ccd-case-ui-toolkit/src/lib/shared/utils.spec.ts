import { safeJsonParse, safeJsonParseFallback } from './json-utils';

describe('safeJsonParseFallback', () => {
  it('returns fallback when value is null', () => {
    const result = safeJsonParseFallback(null, { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('returns fallback when value is invalid JSON', () => {
    const result = safeJsonParseFallback('{not-json', { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('parses valid JSON', () => {
    const result = safeJsonParseFallback('{"ok": true}', { ok: false });
    expect(result).toEqual({ ok: true });
  });
});

describe('safeJsonParse', () => {
  it('returns fallback when value is null', () => {
    const result = safeJsonParse(null, { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('parses valid JSON', () => {
    const result = safeJsonParse('{"ok": true}', { ok: false });
    expect(result).toEqual({ ok: true });
  });

  it('throws when value is invalid JSON', () => {
    expect(() => safeJsonParse('{not-json', { ok: false })).toThrow();
  });
});
