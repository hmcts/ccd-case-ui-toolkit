import { HttpErrorService } from './http-error.service';
import { HttpError } from '../../domain/http/http-error.model';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';

describe('HttpErrorService', () => {
  const CURRENT_URL = 'http://core-case-data.common-components.reform';
  const ERROR_MESSAGE = 'Nein! Nein! Nein!';
  const VALID_ERROR_BODY = {
    'timestamp': '2017-05-24T15:24:17.857+0000',
    'status': 422,
    'error': 'Unprocessable Entity',
    'exception': 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
    'message': 'string is not a known event ID for the specified case type TestAddressBookCase',
    'path': '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
  };

  const HTTP_401_ERROR_BODY = {
    'timestamp': '2017-05-24T15:24:17.857+0000',
    'status': 401,
    'error': 'Unauthorized',
    'message': 'Unauthorized user...',
    'path': CURRENT_URL
  };
  const HTTP_403_ERROR_BODY = {
    'timestamp': '2017-05-24T15:24:17.857+0000',
    'status': 403,
    'error': 'Forbidden',
    'message': 'The server understood the request but refuses to authorize it....',
    'path': CURRENT_URL
  };
  const VALID_ERROR_RESPONSE = new HttpErrorResponse({
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json'),
    error: VALID_ERROR_BODY,
    status: 422
  });
  const VALID_ERROR_RESPONSE_WITH_CHARSET = new HttpErrorResponse({
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json;charset=UTF-8'),
    error: VALID_ERROR_BODY,
    status: 422
  });

  const NOT_VALID_ERROR_RESPONSE = new HttpErrorResponse({
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json'),
    error: '{notvalidjson}'
  });

  const HTTP_401_RESPONSE = new HttpErrorResponse({
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json'),
    error: HTTP_401_ERROR_BODY,
    status: 401
  });

  const HTTP_403_RESPONSE = new HttpErrorResponse({
    headers: new HttpHeaders()
      .set('Content-Type', 'application/json'),
    error: HTTP_403_ERROR_BODY,
    status: 403
  });

  let authService: any;
  let errorService: HttpErrorService;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('authService', ['signIn']);

    errorService = new HttpErrorService(authService);

    jasmine.clock().uninstall();
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('handle()', () => {

    it('should return default error when no error given', (done) => {
      errorService.handle(null)
        .subscribe(
          () => fail('no error'),
          error => {
            expect(error).not.toBeNull();
            expect(error.error).toEqual('Unknown error');
            expect(error.message).toEqual('Something unexpected happened, our technical staff have been automatically notified');
            done();
          }
        );
    });

    it('should convert a valid HttpErrorResponse error into an HttpError', (done) => {
      errorService.handle(VALID_ERROR_RESPONSE)
        .subscribe(
          () => fail('no error'),
          error => {
            expect(error).toEqual(HttpError.from(VALID_ERROR_RESPONSE));
            done();
          }
        );
    });

    it('should handle a valid HttpErrorResponse with charsetInfo', (done) => {
      errorService.handle(VALID_ERROR_RESPONSE_WITH_CHARSET)
        .subscribe(
          () => fail('no error'),
          error => {
            expect(error).toEqual(HttpError.from(VALID_ERROR_RESPONSE_WITH_CHARSET));
            done();
          }
        );
    });

    it('should convert a non-valid HttpErrorResponse error into an HttpError', (done) => {
      errorService.handle(NOT_VALID_ERROR_RESPONSE)
        .subscribe(
          () => fail('no error'),
          error => {
            expect(error).toEqual(HttpError.from(NOT_VALID_ERROR_RESPONSE));
            expect(error.status).toBe(500);
            done();
          }
        );
    });

    it('should use message when error is an unknown object with a message property', (done) => {
      let expectedError = new HttpError();
      expectedError.message = ERROR_MESSAGE;

      errorService.handle({
        message: ERROR_MESSAGE
      })
        .subscribe(
          () => fail('no error'),
          error => {
            expect(error).toEqual(expectedError);
            done();
          }
        );
    });

    it('should trigger sign-in when IDAM returns HTTP-401 as response', () => {
      errorService.handle(HTTP_401_RESPONSE);
      expect(authService.signIn).toHaveBeenCalled();
    });

    it('should trigger sign-in when IDAM returns HTTP-403 as response', () => {
      errorService.handle(HTTP_403_RESPONSE);
      expect(authService.signIn).toHaveBeenCalled();
    });

    it('should empty error when removed', () => {
      errorService.setError(VALID_ERROR_BODY);

      let error = errorService.removeError();

      expect(error).toEqual(VALID_ERROR_BODY);

      error = errorService.removeError();

      expect(error).toEqual(null);
    });
  });
});
