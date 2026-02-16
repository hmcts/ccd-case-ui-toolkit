import { safeJsonParse } from './utils';

describe('safeJsonParse', () => {
  it('returns fallback when value is null', () => {
    const result = safeJsonParse(null, { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('returns fallback when value is invalid JSON', () => {
    const result = safeJsonParse('{not-json', { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('parses valid JSON', () => {
    const result = safeJsonParse('{"ok": true}', { ok: false });
    expect(result).toEqual({ ok: true });
  });
});
