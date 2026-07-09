import { Inject, Injectable, Optional, InjectionToken } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { safeJsonParse } from '../../json-utils';
import { StructuredLoggerService } from '../logging';
import { SessionStorageService } from './session-storage.service';

export type SessionJsonErrorLogger = (error: unknown) => void;

export const SessionErrorRoute = new InjectionToken<string>('SessionErrorRoute');
export const SessionJsonErrorLogger = new InjectionToken<SessionJsonErrorLogger>('SessionJsonErrorLogger');

@Injectable({
  providedIn: 'root',
})
export class SessionStorageGuard implements CanActivate {
  private readonly logger = new StructuredLoggerService();

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router,
    @Optional() @Inject(SessionErrorRoute) private readonly errorRoute?: string,
    @Optional() @Inject(SessionJsonErrorLogger) private readonly errorLogger?: SessionJsonErrorLogger
  ) {}

  public canActivate(): boolean {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (!userInfoStr) {
      return true;
    }

    const parsed = safeJsonParse(userInfoStr, null);
    if (parsed !== null) {
      return true;
    }

    const error = new Error('Invalid userDetails in session storage');
    if (this.errorLogger) {
      this.errorLogger(error);
    } else {
      this.logger.error('Invalid userDetails in session storage.', { error });
    }
    this.router.navigate([this.errorRoute || '/session-error']);
    return false;
  }
}
