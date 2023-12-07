import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { AbstractAppConfig } from '../../../app.config';

/**
 * `Oauth2Service` and `AuthService` cannot be merged as it creates a cyclic dependency on `AuthService` through `HttpErrorService`.
 */
@Injectable()
export class AuthService {

  private static readonly PATH_OAUTH2_REDIRECT = '/oauth2redirect';

  constructor(private readonly appConfig: AbstractAppConfig,
              @Inject(DOCUMENT) private readonly document: any) {}

  public signIn(): void {
    const loginUrl = this.appConfig.getLoginUrl();
    const clientId = this.appConfig.getOAuth2ClientId();
    const redirectUri = encodeURIComponent(this.redirectUri());

    this.document.location.href = `${loginUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  public redirectUri(): string {
    return this.document.location.origin + AuthService.PATH_OAUTH2_REDIRECT;
  }
}
