import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { AbstractAppConfig } from '../../app.config';

/**
 * `Oauth2Service` and `AuthService` cannot be merged as it creates a cyclic dependency on `AuthService` through `HttpErrorService`.
 */
@Injectable()
export class AuthService {

  private static readonly PATH_OAUTH2_REDIRECT = '/oauth2redirect';

  constructor(private appConfig: AbstractAppConfig,
              @Inject(DOCUMENT) private document: any) {}

  public signIn(): void {
    console.log('this.appConfig=', this.appConfig);
    console.log('this.appConfig.config=', this.appConfig.config);
    console.log('this.appConfig.getLoginUrl()=', this.appConfig.getLoginUrl());
    let loginUrl = this.appConfig.getLoginUrl();
    let clientId = this.appConfig.getOAuth2ClientId();
    let redirectUri = encodeURIComponent(this.redirectUri());

    this.document.location.href = `${loginUrl}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  public redirectUri(): string {
    return this.document.location.origin + AuthService.PATH_OAUTH2_REDIRECT;
  }
}
