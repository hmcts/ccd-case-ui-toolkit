import { AuthService } from './auth.service';
import { HttpService } from '../http/http.service';
import { AppConfig } from '../app.config';
import { of } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import createSpyObj = jasmine.createSpyObj;

describe('AuthService', () => {

  const TOKEN_ENDPOINT = 'http://localhost:1234/oauth2/token';
  const RESPONSE = of(new Response(new ResponseOptions()));
  const LOGIN_URL = 'http://idam/login';
  const LOGOUT_URL = 'http://gateway.ccd/logout';
  const OAUTH2_CLIENT_ID = 'some_client_id';
  const REDIRECT_URI = 'http://localhost/oauth2redirect';
  const REDIRECT_URI_ENCODED = encodeURIComponent(REDIRECT_URI);

  let authService: AuthService;
  let httpService: any;
  let appConfig: any;
  let document: any;

  beforeEach(() => {
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    httpService.get.and.returnValue(RESPONSE);

    appConfig = createSpyObj<AppConfig>('appConfig', [
      'getOAuth2TokenEndpointUrl',
      'getOAuth2ClientId',
      'getLoginUrl',
      'getLogoutUrl',
    ]);
    appConfig.getOAuth2TokenEndpointUrl.and.returnValue(TOKEN_ENDPOINT);
    appConfig.getLoginUrl.and.returnValue(LOGIN_URL);
    appConfig.getLogoutUrl.and.returnValue(LOGOUT_URL);
    appConfig.getOAuth2ClientId.and.returnValue(OAUTH2_CLIENT_ID);
    document = {
      location: {
        origin: 'http://localhost'
      }
    };

    authService = new AuthService(appConfig, document);
  });

  describe('signIn', () => {

    it('should redirect IDAM login page', () => {
      authService.signIn();

      let expectedParams = [
        `response_type=code`,
        `client_id=${OAUTH2_CLIENT_ID}`,
        `redirect_uri=${REDIRECT_URI_ENCODED}`,
      ];

      expect(document.location.href)
        .toEqual(`${LOGIN_URL}?${expectedParams.join('&')}`);
    });

  });
});
