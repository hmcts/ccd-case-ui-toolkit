import { HttpService } from './http.service';
import { Headers, Http, RequestOptionsArgs, Response, ResponseOptions } from '@angular/http';
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { HttpErrorService } from './http-error.service';
import { Observable, of, throwError } from 'rxjs';

describe('HttpService', () => {

  const URL = 'http://ccd.reform/';
  const HEADER_1 = 'x-header1';
  const HEADER_1_VALUE = 'x-header1-value';
  const HEADERS = new Headers({});
  const CONTENT_TYPE_HEADER = 'Content-Type';
  const CONTENT_TYPE_HEADER_VALUE = 'X-rated';
  const ACCEPT_HEADER = 'Accept';
  const ACCEPT_HEADER_VALUE = 'text/ccd';
  const HEADERS_WITH_CONTENT_TYPE_DEFINED = new Headers({});
  const HEADERS_WITH_CONTENT_TYPE_NULL = new Headers({});
  const BODY = JSON.stringify({});
  const error = {
    message: ''
  };
  HEADERS.append(HEADER_1, HEADER_1_VALUE);
  HEADERS_WITH_CONTENT_TYPE_DEFINED.append(CONTENT_TYPE_HEADER, CONTENT_TYPE_HEADER_VALUE);
  HEADERS_WITH_CONTENT_TYPE_DEFINED.append(ACCEPT_HEADER, ACCEPT_HEADER_VALUE);
  HEADERS_WITH_CONTENT_TYPE_NULL.append(CONTENT_TYPE_HEADER, null);
  HEADERS_WITH_CONTENT_TYPE_NULL.append(ACCEPT_HEADER, null);
  const EXPECTED_RESPONSE = of(new Response(new ResponseOptions()));

  let httpService: HttpService;

  let httpMock: any;
  let httpErrorService: any;
  let catchObservable: any;

  beforeEach(() => {
    catchObservable = createSpyObj<Observable<Response>>('observable', ['pipe']);
    catchObservable.pipe.and.returnValue(EXPECTED_RESPONSE);

    httpMock = createSpyObj<Http>('http', ['get', 'post', 'put', 'delete']);
    httpMock.get.and.returnValue(catchObservable);
    httpMock.post.and.returnValue(catchObservable);
    httpMock.put.and.returnValue(catchObservable);
    httpMock.delete.and.returnValue(catchObservable);

    httpErrorService = createSpyObj<HttpErrorService>('httpErrorService', ['handle']);
    httpErrorService.handle.and.returnValue(throwError(error));

    httpService = new HttpService(httpMock, httpErrorService);
  });

  describe('get', () => {

    it('should forward simple call to Angular Http service', () => {
      let response = httpService.get(URL);

      expect(httpMock.get).toHaveBeenCalledWith(URL, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.get(URL, options);

      expect(httpMock.get).toHaveBeenCalledWith(URL, options);
    });

    it('should sanitise headers when provided', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.get(URL, options);

      expectHeadersToBeSanitized(httpMock.get.calls.mostRecent().args[1]);
    });

    it('should not add `content-type` and `accept` headers when defined', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS_WITH_CONTENT_TYPE_DEFINED,
        withCredentials: true,
      };

      httpService.get(URL, options);

      let headers = httpMock.get.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual(CONTENT_TYPE_HEADER_VALUE);
      expect(headers.get('Accept')).toEqual(ACCEPT_HEADER_VALUE);
    });

    it('should not add `content-type` and `accept` headers when defined with null values', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS_WITH_CONTENT_TYPE_NULL,
        withCredentials: true,
      };

      httpService.get(URL, options);

      let headers = httpMock.get.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toBe(null);
      expect(headers.get('Accept')).toBe(null);
    });

    it('should add `content-type` and `accept` headers when not defined', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.get(URL, options);

      let headers = httpMock.get.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });

    it('should catch with http-error service', () => {
      httpMock.get.and.returnValue(throwError(error));
      httpService.get(URL).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error, true);
    });
  });

  describe('post', () => {

    it('should forward simple call to Angular Http service', () => {
      let response = httpService.post(URL, BODY);

      expect(httpMock.post).toHaveBeenCalledWith(URL, BODY, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.post(URL, BODY, options);

      expect(httpMock.post).toHaveBeenCalledWith(URL, BODY, options);
    });

    it('should sanitise headers when provided', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.post(URL, BODY, options);

      expectHeadersToBeSanitized(httpMock.post.calls.mostRecent().args[2]);
    });

    it('should catch with http-error service', () => {
      httpMock.post.and.returnValue(throwError(error));
      httpService.post(URL, BODY).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error, true);
    });

    it('should add a `content-type` and `accept` headers', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.post(URL, BODY, options);

      let headers = httpMock.post.calls.mostRecent().args[2].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });
  });

  describe('put', () => {

    it('should forward simple call to Angular Http service', () => {
      let response = httpService.put(URL, BODY);

      expect(httpMock.put).toHaveBeenCalledWith(URL, BODY, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.put(URL, BODY, options);

      expect(httpMock.put).toHaveBeenCalledWith(URL, BODY, options);
    });

    it('should sanitise headers when provided', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.put(URL, BODY, options);

      expectHeadersToBeSanitized(httpMock.put.calls.mostRecent().args[2]);
    });

    it('should catch with http-error service', () => {
      httpMock.put.and.returnValue(throwError(error));
      httpService.put(URL, BODY).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error);
    });

    it('should add a `content-type` and `accept` headers', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.put(URL, BODY, options);

      let headers = httpMock.put.calls.mostRecent().args[2].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });
  });

  describe('delete', () => {

    it('should forward simple call to Angular Http service', () => {
      let response = httpService.delete(URL);

      expect(httpMock.delete).toHaveBeenCalledWith(URL, any(Object));
      expect(response).toBe(EXPECTED_RESPONSE);
    });

    it('should forward headers to Angular Http service', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.delete(URL, options);

      expect(httpMock.delete).toHaveBeenCalledWith(URL, options);
    });

    it('should sanitise headers when provided', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.delete(URL, options);

      expectHeadersToBeSanitized(httpMock.delete.calls.mostRecent().args[1]);
    });

    it('should catch with http-error service', () => {
      httpMock.delete.and.returnValue(throwError(error));
      httpService.delete(URL).subscribe(() => {}, () => {});
      expect(httpErrorService.handle).toHaveBeenCalledWith(error);
    });

    it('should add a `content-type` and `accept` headers', () => {
      let options: RequestOptionsArgs = {
        headers: HEADERS,
        withCredentials: true,
      };

      httpService.delete(URL, options);

      let headers = httpMock.delete.calls.mostRecent().args[1].headers;
      expect(headers.get('Content-Type')).toEqual('application/json');
      expect(headers.get('Accept')).toEqual('application/json');
    });
  });

  function expectHeadersToBeSanitized(options) {
    let headers = options.headers;

    expect(headers).toBeDefined();
    expect(headers.get(HEADER_1)).toEqual(HEADER_1_VALUE);
  }
});
