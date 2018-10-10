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
      'timestamp': '2017-05-24T15:24:17.857+0000',
      'status': 422,
      'error': 'Unprocessable Entity',
      'exception': 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
      'message': 'string is not a known event ID for the specified case type TestAddressBookCase',
      'path': '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
    };

    const ERROR_PARTIAL = {
      'status': 422,
      'error': 'Unprocessable Entity',
      'exception': 'uk.gov.hmcts.ccd.endpoint.exceptions.ValidationException',
      'path': '/caseworkers/0/jurisdictions/TEST/case-types/TestAddressBookCase/cases'
    };

    it('should return default error when given empty object', () => {
      let error = HttpError.from({});

      expect(error).toEqual(new HttpError());
    });

    it('should copy all known properties from object to error', () => {
      let error = HttpError.from(ERROR_FULL);

      let expectedError = new HttpError();
      expectedError.timestamp = ERROR_FULL.timestamp;
      expectedError.status = ERROR_FULL.status;
      expectedError.error = ERROR_FULL.error;
      expectedError.exception = ERROR_FULL.exception;
      expectedError.message = ERROR_FULL.message;
      expectedError.path = ERROR_FULL.path;

      expect(error).toEqual(expectedError);
    });

    it('should ignore unknown properties from object to error', () => {
      let error = HttpError.from(ERROR_PARTIAL);

      let expectedError = new HttpError();
      expectedError.status = ERROR_PARTIAL.status;
      expectedError.error = ERROR_PARTIAL.error;
      expectedError.exception = ERROR_PARTIAL.exception;
      expectedError.path = ERROR_PARTIAL.path;

      expect(error).toEqual(expectedError);
    });

    it('should ignore additional properties of object', () => {
      let error = HttpError.from({ unknown: 'xxx'});

      expect(error).toEqual(new HttpError());
    });

  });

});
