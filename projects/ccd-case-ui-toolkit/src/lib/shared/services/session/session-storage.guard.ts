import { Inject, Injectable, Optional, InjectionToken } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { safeJsonParse } from '../../json-utils';
import { SessionStorageService } from './session-storage.service';

export type SessionJsonErrorLogger = (error: unknown) => void;

export const SessionErrorRoute = new InjectionToken<string>('SessionErrorRoute');
export const SessionJsonErrorLogger = new InjectionToken<SessionJsonErrorLogger>('SessionJsonErrorLogger');

@Injectable({
  providedIn: 'root',
})
export class SessionStorageGuard implements CanActivate {
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

    try {
      safeJsonParse(userInfoStr, null);
      return true;
    } catch (error) {
      if (this.errorLogger) {
        this.errorLogger(error);
      } else {
        // eslint-disable-next-line no-console
        console.error('Invalid userDetails in session storage', error);
      }
      this.router.navigate([this.errorRoute || '/session-error']);
      return false;
    }
  }
}
