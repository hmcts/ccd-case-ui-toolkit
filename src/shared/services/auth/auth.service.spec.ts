import { AuthService } from './auth.service';
import { HttpService } from '../http/http.service';
import { of } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../app.config';

describe('AuthService', () => {

  const RESPONSE = of(new Response(new ResponseOptions()));
  const LOGIN_URL = 'http://idam/login';
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

    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getOAuth2ClientId',
      'getLoginUrl',
    ]);
    appConfig.getLoginUrl.and.returnValue(LOGIN_URL);
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
