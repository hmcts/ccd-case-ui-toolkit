import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpError } from '../../domain/http/http-error.model';
import { HttpErrorService } from './http-error.service';

@Injectable()
export class HttpService {

  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

  constructor(
    private readonly httpclient: HttpClient,
    private readonly httpErrorService: HttpErrorService
  ) {}

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options OptionsType
   * @returns Observable<any> return value
   * @see UrlResolverService
   */

  public get(
    url: string,
    options?: OptionsType,
    redirectIfNotAuthorised = true,
    errorHandler?: (error: HttpErrorResponse) => HttpError): Observable<any> {
    return this.httpclient
      .get(url, this.setDefaultValue(options))
      .pipe(
        catchError((res: HttpErrorResponse) => {
          let error: HttpErrorResponse | HttpError = res;
          if (typeof errorHandler === 'function') {
            error = errorHandler(res);
          }
          return this.httpErrorService.handle(error, redirectIfNotAuthorised);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body Body for post
   * @param options OptionsType
   * @returns Observable<any> return value
   * @see UrlResolverService
   */
  public post(url: string, body: any, options?: OptionsType, redirectIfNotAuthorised = true): Observable<any> {
    return this.httpclient
      .post(url, body, this.setDefaultValue(options))
      .pipe(
        catchError((res: HttpErrorResponse) => {
          return this.httpErrorService.handle(res, redirectIfNotAuthorised);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body Body for post
   * @param options OptionsType
   * @returns Observable<any> return value
   * @see UrlResolverService
   */
  public put(url: string, body: any, options?: OptionsType): Observable<any> {
    return this.httpclient
      .put(url, body, this.setDefaultValue(options))
      .pipe(
        catchError((res: HttpErrorResponse) => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options OptionsType
   * @returns Observable<any> return value
   * @see UrlResolverService
   */
  public delete(url: string, options?: OptionsType): Observable<any> {
    return this.httpclient
      .delete(url, this.setDefaultValue(options))
      .pipe(
        catchError((res: HttpErrorResponse) => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  public setDefaultValue(options?: OptionsType): OptionsType {
    options = options || {observe: 'body'};
    options.withCredentials = true;

    if (!options.headers) {
      options.headers = new HttpHeaders()
        .set(HttpService.HEADER_ACCEPT, 'application/json')
        .set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
    }
    return options;
  }
}

export interface OptionsType {
  headers?: HttpHeaders;
  observe: 'body';
  params?: HttpParams | { [param: string]: string | string[]; };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
