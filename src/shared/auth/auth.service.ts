import { Inject, Injectable } from '@angular/core';
import { AppConfig } from '../app.config';
import { DOCUMENT } from '@angular/common';

/**
 * `Oauth2Service` and `AuthService` cannot be merged as it creates a cyclic dependency on `AuthService` through `HttpErrorService`.
 */
@Injectable()
export class AuthService {

  private static readonly PATH_OAUTH2_REDIRECT = '/oauth2redirect';

  constructor(private appConfig: AppConfig,
              @Inject(DOCUMENT) private document: any) {}

  public signIn(): void {
    let loginUrl = this.appConfig.getLoginUrl();
    let clientId = this.appConfig.getOAuth2ClientId();
    let redirectUri = encodeURIComponent(this.redirectUri());

    this.document.location.href = `${loginUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  public redirectUri(): string {
    return this.document.location.origin + AuthService.PATH_OAUTH2_REDIRECT;
  }
}
