import { Injectable } from '@angular/core';

export type StructuredLogLevel = 'error' | 'warn' | 'info' | 'debug';

export interface StructuredLogEntry {
  level: StructuredLogLevel;
  message: string;
  timestamp: string;
  context?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class StructuredLoggerService {
  private static readonly CIRCULAR_VALUE = '[Circular]';
  private static readonly MAX_DEPTH_VALUE = '[MaxDepth]';
  private static readonly MAX_REDACTION_DEPTH = 10;
  private static readonly REDACTED_VALUE = '[REDACTED]';
  private static readonly SENSITIVE_KEY_PATTERN = /(password|passcode|pwd|secret|token|authori[sz]ation|authentication|auth[-_]?context|^auth$|api[-_]?key|cookie|session|credential)/i;
  private static readonly SENSITIVE_STRING_PATTERN = /((?:password|passcode|pwd|secret|token|authori[sz]ation|auth(?:entication|[-_ ]?context)?|api[-_]?key|cookie|session|credential)\s*[:=]\s*)((?:Bearer\s+)?)([^,;&\s]+)/gi;
  private static readonly BEARER_TOKEN_PATTERN = /\bBearer\s+([A-Za-z0-9\-._~+/]+=*)/gi;

  public debug(message: string, context?: unknown): void {
    this.write('debug', message, context);
  }

  public error(message: string, context?: unknown): void {
    this.write('error', message, context);
  }

  public info(message: string, context?: unknown): void {
    this.write('info', message, context);
  }

  public warn(message: string, context?: unknown): void {
    this.write('warn', message, context);
  }

  public redact(value: unknown): unknown {
    return this.redactValue(value, new WeakSet<object>(), false, 0);
  }

  private write(level: StructuredLogLevel, message: string, context?: unknown): void {
    const entry: StructuredLogEntry = {
      level,
      message,
      timestamp: new Date().toISOString()
    };

    if (context !== undefined) {
      entry.context = this.redact(context);
    }

    switch (level) {
      case 'error':
        console.error(entry);
        break;
      case 'warn':
        console.warn(entry);
        break;
      default:
        console.log(entry);
    }
  }

  private redactValue(value: unknown, seen: WeakSet<object>, redactCurrentValue: boolean, depth: number): unknown {
    if (redactCurrentValue) {
      return StructuredLoggerService.REDACTED_VALUE;
    }

    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === 'string') {
      return this.redactSensitiveString(value);
    }

    if (typeof value !== 'object') {
      return value;
    }

    if (seen.has(value)) {
      return StructuredLoggerService.CIRCULAR_VALUE;
    }

    if (depth >= StructuredLoggerService.MAX_REDACTION_DEPTH) {
      return StructuredLoggerService.MAX_DEPTH_VALUE;
    }

    seen.add(value);

    let redactedValue: unknown;
    if (value instanceof Date) {
      redactedValue = value.toISOString();
    } else if (value instanceof Error) {
      redactedValue = this.redactError(value, seen, depth);
    } else if (Array.isArray(value)) {
      redactedValue = value.map(item => this.redactValue(item, seen, false, depth + 1));
    } else {
      redactedValue = this.redactObject(value as Record<string, unknown>, seen, depth);
    }

    seen.delete(value);
    return redactedValue;
  }

  private redactError(error: Error, seen: WeakSet<object>, depth: number): Record<string, unknown> {
    const redactedError: Record<string, unknown> = {
      name: this.redactValue(error.name, seen, false, depth + 1),
      message: this.redactValue(error.message, seen, false, depth + 1)
    };

    if (error.stack) {
      redactedError.stack = this.redactValue(error.stack, seen, false, depth + 1);
    }

    const errorContext = error as unknown as Record<string, unknown>;
    Object.keys(errorContext).forEach(key => {
      redactedError[key] = this.redactValue(errorContext[key], seen, this.isSensitiveKey(key), depth + 1);
    });

    return redactedError;
  }

  private redactObject(value: Record<string, unknown>, seen: WeakSet<object>, depth: number): Record<string, unknown> {
    const redactedValue: Record<string, unknown> = {};
    const hasSensitiveNamedValue = this.hasSensitiveNamedValue(value);

    Object.keys(value).forEach(key => {
      redactedValue[key] = this.redactValue(
        value[key],
        seen,
        this.isSensitiveKey(key) || (hasSensitiveNamedValue && this.isValueKey(key)),
        depth + 1
      );
    });

    return redactedValue;
  }

  private redactSensitiveString(value: string): string {
    return value
      .replace(StructuredLoggerService.SENSITIVE_STRING_PATTERN, '$1$2[REDACTED]')
      .replace(StructuredLoggerService.BEARER_TOKEN_PATTERN, 'Bearer [REDACTED]');
  }

  private hasSensitiveNamedValue(value: Record<string, unknown>): boolean {
    return Object.keys(value)
      .some(key => this.isNameKey(key) && typeof value[key] === 'string' && this.isSensitiveKey(value[key] as string));
  }

  private isNameKey(key: string): boolean {
    return ['key', 'name'].indexOf(key.toLowerCase()) > -1;
  }

  private isSensitiveKey(key: string): boolean {
    return StructuredLoggerService.SENSITIVE_KEY_PATTERN.test(key);
  }

  private isValueKey(key: string): boolean {
    return ['value', 'values'].indexOf(key.toLowerCase()) > -1;
  }
}
