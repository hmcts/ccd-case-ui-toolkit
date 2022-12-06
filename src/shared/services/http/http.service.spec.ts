import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';

import { HttpError } from '../../domain';
import { HttpErrorService } from './http-error.service';
import { HttpService, OptionsType } from './http.service';

import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;

describe('HttpService', () => {
  const URL = 'http://ccd.reform/';
  const HEADER_1 = 'x-header1';
  const HEADER_1_VALUE = 'x-header1-value';
  const HEADERS = new HttpHeaders()
    .set(HEADER_1, HEADER_1_VALUE);
  const CONTENT_TYPE_HEADER = 'Content-Type';
  const CONTENT_TYPE_HEADER_VALUE = 'X-rated';
  const CONTENT_TYPE_APPLICATION_JSON = 'application/json';
  const ACCEPT_HEADER = 'Accept';
  const ACCEPT_HEADER_VALUE = 'text/ccd';
  const HEADERS_WITH_CONTENT_TYPE_DEFINED = new HttpHeaders()
    .set(CONTENT_TYPE_HEADER, CONTENT_TYPE_HEADER_VALUE)
    .set(ACCEPT_HEADER, ACCEPT_HEADER_VALUE);
  const BODY = JSON.stringify({});
  const error = {
    message: ''
  };
  const httpErrorResponse = new HttpErrorResponse({
    error: {
      error: 'Unprocessible Entity',
      status: 422
    },
    headers: new HttpHeaders().set(CONTENT_TYPE_HEADER, CONTENT_TYPE_APPLICATION_JSON),
    status: 422
  });
  const EXPECTED_RESPONSE = of(new HttpResponse());
  let httpService: HttpService;

  let httpMock: jasmine.SpyObj<HttpClient>;
  let httpErrorService: jasmine.SpyObj<HttpErrorService>;
  let catchObservable: jasmine.SpyObj<Observable<any>>;
  const realHttpErrorService = new HttpErrorService(null);

  beforeEach(() => {
    catchObservable = createSpyObj<Observable<any>>('observable', ['pipe']);
    catchObservable.pipe.and.returnValue(EXPECTED_RESPONSE);

    httpMock = createSpyObj<HttpClient>('http', ['get', 'post', 'put', 'delete']);
    httpMock.get.and.returnValue(catchObservable);
    httpMock.post.and.returnValue(catchObservable);
    httpMock.put.and.returnValue(catchObservable);
    httpMock.delete.and.returnValue(catchObservable);

    httpErrorService = createSpyObj<HttpErrorService>('httpErrorService', ['handle']);
    httpErrorService.handle.and.returnValue(throwError(error));

    httpService = new HttpService(httpMock, httpErrorService);

    spyOn(realHttpErrorService, 'handle').and.callThrough();
    spyOn(HttpError, 'from').and.callThrough();
  });

  describe('get', () => {

    it('should forward simple call to Angular Http service', () => {
      const response = httpService.get(URL);

      expect(httpMock.get).toHaveBeenCalledWith(URL, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.get(URL, options);

      expect(httpMock.get).toHaveBeenCalledWith(URL, options);
    });

    it('should sanitise headers when provided', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.get(URL, options);

      expectHeadersToBeSanitized(httpMock.get.calls.mostRecent().args[1]);
    });

    it('should return same header properties when `headers` is defined', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };
      const returnOptions = httpService.setDefaultValue(options);
      expect(returnOptions.headers).toEqual(options.headers);
    });

    it('should not add `content-type` and `accept` headers when defined', () => {
      const options: OptionsType = {
        headers: HEADERS_WITH_CONTENT_TYPE_DEFINED,
        withCredentials: true,
        observe: 'body',
      };

      httpService.get(URL, options);

      const headers = httpMock.get.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual(CONTENT_TYPE_HEADER_VALUE);
      expect(headers.get('Accept')).toEqual(ACCEPT_HEADER_VALUE);
    });

    it('should define headers when not defined', () => {
      const options: OptionsType = {
        headers: null,
        withCredentials: true,
        observe: 'body',
      };

      httpService.get(URL, options);

      expect(options.headers).toBeDefined();
    });

    it('should add `content-type` and `accept` headers when not defined', () => {
      const options: OptionsType = {
        headers: null,
        withCredentials: true,
        observe: 'body',
      };

      httpService.get(URL, options);

      const headers = httpMock.get.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });

    it('should catch with http-error service', () => {
      httpMock.get.and.returnValue(throwError(error));
      httpService.get(URL).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error, true);
    });

    it('should catch with http-error service and map HttpErrorResponse to HttpError object', () => {
      httpMock.get.and.returnValue(throwError(httpErrorResponse));
      // Switch to real HttpErrorService to check handle() function calls HttpError.from(), which maps
      // HttpErrorResponse "error" object properties to HttpError instance
      httpService = new HttpService(httpMock, realHttpErrorService);
      httpService.get(URL).subscribe(() => {}, () => {});
      expect(realHttpErrorService.handle).toHaveBeenCalledWith(httpErrorResponse, true);
      expect(HttpError.from).toHaveBeenCalledWith(httpErrorResponse);
    });

    it('should call the supplied errorHandler method if provided', () => {
      let errorHandlerCalls = [];
      const errorHandler = (response: HttpErrorResponse): HttpError => {
        errorHandlerCalls.push(response);
        return null;
      };
      httpMock.get.and.returnValue(throwError(httpErrorResponse));
      // Switch to real HttpErrorService to check handle() function calls HttpError.from(), which maps
      // HttpErrorResponse "error" object properties to HttpError instance
      httpService = new HttpService(httpMock, realHttpErrorService);
      httpService.get(URL, null, false, errorHandler).subscribe(() => {}, () => {});
      expect(errorHandlerCalls.length).toEqual(1);
      expect(errorHandlerCalls[0]).toEqual(httpErrorResponse);
      expect(realHttpErrorService.handle).toHaveBeenCalledWith(null, false);
    });
  });

  describe('post', () => {

    it('should forward simple call to Angular Http service', () => {
      const response = httpService.post(URL, BODY);

      expect(httpMock.post).toHaveBeenCalledWith(URL, BODY, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.post(URL, BODY, options);

      expect(httpMock.post).toHaveBeenCalledWith(URL, BODY, options);
    });

    it('should sanitise headers when provided', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.post(URL, BODY, options);

      expectHeadersToBeSanitized(httpMock.post.calls.mostRecent().args[2]);
    });

    it('should add `content-type` and `accept` headers when not defined', () => {
      const options: OptionsType = {
        headers: null,
        withCredentials: true,
        observe: 'body',
      };

      httpService.post(URL, BODY, options);

      const headers = httpMock.post.calls.mostRecent().args[2].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });

    it('should catch with http-error service', () => {
      httpMock.post.and.returnValue(throwError(error));
      httpService.post(URL, BODY).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error, true);
    });

    it('should catch with http-error service and map HttpErrorResponse to HttpError object', () => {
      httpMock.post.and.returnValue(throwError(httpErrorResponse));
      // Switch to real HttpErrorService to check handle() function calls HttpError.from(), which maps
      // HttpErrorResponse "error" object properties to HttpError instance
      httpService = new HttpService(httpMock, realHttpErrorService);
      httpService.post(URL, BODY).subscribe(() => {}, () => {});
      expect(realHttpErrorService.handle).toHaveBeenCalledWith(httpErrorResponse, true);
      expect(HttpError.from).toHaveBeenCalledWith(httpErrorResponse);
    });
  });

  describe('put', () => {

    it('should forward simple call to Angular Http service', () => {
      const response = httpService.put(URL, BODY);

      expect(httpMock.put).toHaveBeenCalledWith(URL, BODY, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.put(URL, BODY, options);

      expect(httpMock.put).toHaveBeenCalledWith(URL, BODY, options);
    });

    it('should sanitise headers when provided', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.put(URL, BODY, options);

      expectHeadersToBeSanitized(httpMock.put.calls.mostRecent().args[2]);
    });

    it('should add `content-type` and `accept` headers when not defined', () => {
      const options: OptionsType = {
        headers: null,
        withCredentials: true,
        observe: 'body',
      };

      httpService.put(URL, BODY, options);

      const headers = httpMock.put.calls.mostRecent().args[2].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });

    it('should catch with http-error service', () => {
      httpMock.put.and.returnValue(throwError(error));
      httpService.put(URL, BODY).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error);
    });

    it('should catch with http-error service and map HttpErrorResponse to HttpError object', () => {
      httpMock.put.and.returnValue(throwError(httpErrorResponse));
      // Switch to real HttpErrorService to check handle() function calls HttpError.from(), which maps
      // HttpErrorResponse "error" object properties to HttpError instance
      httpService = new HttpService(httpMock, realHttpErrorService);
      httpService.put(URL, BODY).subscribe(() => {}, () => {});
      expect(realHttpErrorService.handle).toHaveBeenCalledWith(httpErrorResponse);
      expect(HttpError.from).toHaveBeenCalledWith(httpErrorResponse);
    });
  });

  describe('delete', () => {

    it('should forward simple call to Angular Http service', () => {
      const response = httpService.delete(URL);

      expect(httpMock.delete).toHaveBeenCalledWith(URL, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.delete(URL, options);

      expect(httpMock.delete).toHaveBeenCalledWith(URL, options);
    });

    it('should sanitise headers when provided', () => {
      const options: OptionsType = {
        headers: HEADERS,
        withCredentials: true,
        observe: 'body',
      };

      httpService.delete(URL, options);

      expectHeadersToBeSanitized(httpMock.delete.calls.mostRecent().args[1]);
    });

    it('should add `content-type` and `accept` headers when not defined', () => {
      const options: OptionsType = {
        headers: null,
        withCredentials: true,
        observe: 'body',
      };

      httpService.delete(URL, options);

      const headers = httpMock.delete.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });

    it('should catch with http-error service', () => {
      httpMock.delete.and.returnValue(throwError(error));
      httpService.delete(URL).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error);
    });

    it('should catch with http-error service and map HttpErrorResponse to HttpError object', () => {
      httpMock.delete.and.returnValue(throwError(httpErrorResponse));
      // Switch to real HttpErrorService to check handle() function calls HttpError.from(), which maps
      // HttpErrorResponse "error" object properties to HttpError instance
      httpService = new HttpService(httpMock, realHttpErrorService);
      httpService.delete(URL).subscribe(() => {}, () => {});
      expect(realHttpErrorService.handle).toHaveBeenCalledWith(httpErrorResponse);
      expect(HttpError.from).toHaveBeenCalledWith(httpErrorResponse);
    });
  });

  function expectHeadersToBeSanitized(options) {
    const headers = options.headers;

    expect(headers).toBeDefined();
    expect(headers.get(HEADER_1)).toEqual(HEADER_1_VALUE);
  }
});
