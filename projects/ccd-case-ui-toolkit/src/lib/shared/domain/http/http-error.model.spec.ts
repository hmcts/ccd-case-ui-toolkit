import { HttpErrorResponse } from '@angular/common/http';
import { HttpError } from './http-error.model';

describe('HttpError', () => {

  beforeEach(() => {
    jasmine.clock().uninstall();
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  describe('from()', () => {

    const ERROR_FULL = {
      timestamp: '2017-05-24T15:24:17.857+0000',
      status: 422,
      error: 'Unprocessable Entity',
      exception: 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
      message: 'string is not a known event ID for the specified case type TestAddressBookCase',
      path: '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
    };

    const ERROR_PARTIAL = {
      status: 422,
      error: 'Unprocessable Entity',
      exception: 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
      path: '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
    };

    const ERROR_FORBIDDEN = {
      error: {},
      message: 'Http failure response for http://localhost:3000/data/internal/cases/1234123412341234: 403 Forbidden',
      name: 'HttpErrorResponse',
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      url: 'http://localhost:3000/data/internal/cases/1234123412341234'
    };

    const ERROR_TOO_MANY_TIMES = {
      status: 429,
      error: 'Your request was rate limited. Please wait a few seconds before retrying your document upload',
      message: 'Http failure response for http://localhost:3000/documentsv2: 429 Too Many Requests',
      statusText: 'Too Many Requests',
      url: 'http://localhost:3000/documentsv2'
    };

    it('should return default error when given null', () => {
      const error = HttpError.from(null);

      expect(error).toEqual(new HttpError());
      expect(error.status).toBe(500);
    });

    it('should copy all known properties from object to error', () => {
      const error = HttpError.from(new HttpErrorResponse({ error: ERROR_FULL }));

      const expectedError = new HttpError();
      expectedError.timestamp = ERROR_FULL.timestamp;
      expectedError.status = ERROR_FULL.status;
      expectedError.error = ERROR_FULL.error;
      expectedError.exception = ERROR_FULL.exception;
      expectedError.message = ERROR_FULL.message;
      expectedError.path = ERROR_FULL.path;

      expect(error).toEqual(expectedError);
    });

    it('should ignore unknown properties from object to error', () => {
      const error = HttpError.from(new HttpErrorResponse({ error: ERROR_PARTIAL }));

      const expectedError = new HttpError();
      expectedError.status = ERROR_PARTIAL.status;
      expectedError.error = ERROR_PARTIAL.error;
      expectedError.exception = ERROR_PARTIAL.exception;
      expectedError.path = ERROR_PARTIAL.path;

      expect(error).toEqual(expectedError);
    });

    it('should return the error properties for forbidden error', () => {
      const error = HttpError.from(new HttpErrorResponse(ERROR_FORBIDDEN));

      const expectedError = new HttpError();
      expectedError.error = ERROR_FORBIDDEN.statusText;
      expectedError.status = ERROR_FORBIDDEN.status;
      expectedError.message = ERROR_FORBIDDEN.message;

      expect(error).toEqual(expectedError);
    });

    it('should ignore additional properties of object', () => {
      const error = HttpError.from(new HttpErrorResponse({ error: { unknown: 'xxx' } }));

      expect(error).toEqual(new HttpError());
    });


    it('should return the error properties for Too many requests', () => {
      const error = HttpError.from(new HttpErrorResponse(ERROR_TOO_MANY_TIMES));

      const expectedError = new HttpError();
      expectedError.error = ERROR_TOO_MANY_TIMES.error;
      expectedError.status = ERROR_TOO_MANY_TIMES.status;
      expectedError.message = ERROR_TOO_MANY_TIMES.message;

      expect(error).toEqual(expectedError);
    });

  });

});
