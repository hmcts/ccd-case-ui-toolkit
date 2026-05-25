import { StructuredLogEntry, StructuredLoggerService } from './structured-logger.service';

describe('StructuredLoggerService', () => {
  let logger: StructuredLoggerService;

  beforeEach(() => {
    logger = new StructuredLoggerService();
  });

  it('should write structured warning logs with redacted sensitive fields', () => {
    const warnSpy = spyOn(console, 'warn');

    logger.warn('Request failed', {
      safeField: 'visible',
      authContext: { userId: 'sensitive-user' },
      authorisation: 'sensitive-authorisation',
      token: 'secret-token',
      nested: {
        password: 'secret-password',
        clientSecret: 'secret-client'
      },
      headers: [
        { name: 'Authorization', value: 'Bearer header-token' },
        { key: 'refreshToken', values: ['refresh-token'] }
      ]
    });

    const entry = warnSpy.calls.mostRecent().args[0] as StructuredLogEntry;
    const context = entry.context as any;

    expect(entry.level).toBe('warn');
    expect(entry.message).toBe('Request failed');
    expect(entry.timestamp).toEqual(jasmine.any(String));
    expect(context.safeField).toBe('visible');
    expect(context.authContext).toBe('[REDACTED]');
    expect(context.authorisation).toBe('[REDACTED]');
    expect(context.token).toBe('[REDACTED]');
    expect(context.nested.password).toBe('[REDACTED]');
    expect(context.nested.clientSecret).toBe('[REDACTED]');
    expect(context.headers[0].value).toBe('[REDACTED]');
    expect(context.headers[1].values).toBe('[REDACTED]');
    expect(JSON.stringify(entry)).not.toContain('secret-token');
    expect(JSON.stringify(entry)).not.toContain('sensitive-user');
    expect(JSON.stringify(entry)).not.toContain('sensitive-authorisation');
    expect(JSON.stringify(entry)).not.toContain('secret-password');
    expect(JSON.stringify(entry)).not.toContain('secret-client');
    expect(JSON.stringify(entry)).not.toContain('header-token');
    expect(JSON.stringify(entry)).not.toContain('refresh-token');
  });

  it('should redact sensitive values inside error messages', () => {
    const errorSpy = spyOn(console, 'error');
    const error = new Error('Authorization: Bearer secret-token');
    (error as any).token = 'secret-token';

    logger.error('Activity request failed', { error });

    const entry = errorSpy.calls.mostRecent().args[0] as StructuredLogEntry;

    expect(JSON.stringify(entry)).toContain('Bearer [REDACTED]');
    expect(JSON.stringify(entry)).not.toContain('secret-token');
  });

  it('should handle circular context safely', () => {
    const warnSpy = spyOn(console, 'warn');
    const context: any = { safeField: 'visible' };
    context.self = context;

    logger.warn('Circular context', context);

    const entry = warnSpy.calls.mostRecent().args[0] as StructuredLogEntry;

    expect((entry.context as any).self).toBe('[Circular]');
  });
});
