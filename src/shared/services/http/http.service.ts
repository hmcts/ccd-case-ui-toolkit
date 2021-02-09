import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';
import { HttpErrorService } from './http-error.service';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { HttpObserve } from '@angular/common/http/src/client';

@Injectable()
export class HttpService {

  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

  constructor(
    private httpclient: HttpClient,
    private httpErrorService: HttpErrorService
  ) {}

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options
   * @returns {Observable<any>}
   * @see UrlResolverService
   */

  public get(url: string, options?: OptionsType, redirectIfNotAuthorised = true): Observable<any> {
    console.log('In get');
    return this.httpclient
      .get(url, this.setDefaultValue(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res, redirectIfNotAuthorised);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body
   * @param options
   * @returns {Observable<any>}
   * @see UrlResolverService
   */
  public post(url: string, body: any, options?: OptionsType, redirectIfNotAuthorised = true): Observable<any> {
    console.log('In post');
    return this.httpclient
      .post(url, body, this.setDefaultValue(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res, redirectIfNotAuthorised);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param body
   * @param options
   * @returns {Observable<any>}
   * @see UrlResolverService
   */
  public put(url: string, body: any, options?: OptionsType): Observable<any> {
    console.log('In put');
    return this.httpclient
      .put(url, body, this.setDefaultValue(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options
   * @returns {Observable<any>}
   * @see UrlResolverService
   */
  public delete(url: string, options?: OptionsType): Observable<any> {
    console.log('In delete');
    return this.httpclient
      .delete(url, this.setDefaultValue(options))
      .pipe(
        catchError(res => {
          return this.httpErrorService.handle(res);
        })
      );
  }

  public setDefaultValue(options?: OptionsType): OptionsType {

    return {
      headers: options.headers ? options.headers : HttpService.getDefaultHttpHeaders(),
      observe: 'body',
      params: options.params ? options.params : new HttpParams(),
      reportProgress: options.reportProgress,
      responseType: options.responseType ? options.responseType : 'json',
      withCredentials: options.withCredentials ? options.withCredentials : true
    };

    //try {      
      // options = options || {observe: 'body'};    
      // options.withCredentials = true;
      // console.log('Start',JSON.stringify(options.headers));
      // let headers = options.headers ? options.headers : new HttpHeaders();
      // console.log('In headers',JSON.stringify(headers));
      
      // const val1 = headers.has(HttpService.HEADER_ACCEPT);
      // console.log('Val1', val1);

      /*if (!headers) {
        //headers = new HttpHeaders();
          //.set(HttpService.HEADER_ACCEPT, 'application/json')
          //.set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
          console.log('H1', JSON.stringify(headers));
      } else if (!(headers instanceof HttpHeaders)) {
        //headers = new HttpHeaders();
          //.set(HttpService.HEADER_ACCEPT, 'application/json')
          //.set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
          console.log('H2', JSON.stringify(headers));
      }*/
      
    /*
      if (!headers.has(HttpService.HEADER_ACCEPT)) {         
        // options.headers = new HttpHeaders()
        //   .set(HttpService.HEADER_ACCEPT, 'application/json')
        //   .set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
        headers = headers.set(HttpService.HEADER_ACCEPT, 'application/json');
        //console.log('H3', JSON.stringify(headers));
      }
    
      if (!headers.has(HttpService.HEADER_CONTENT_TYPE)) {  

      }
      //console.log('H5', JSON.stringify(headers));
       if (null === headers.get(HttpService.HEADER_CONTENT_TYPE)) {
         headers = headers.delete(HttpService.HEADER_CONTENT_TYPE);
      //   console.log('H6', JSON.stringify(headers));
       }*/
      // options.headers = headers;
      // console.log('H7', JSON.stringify(headers));
    // }
    // catch (error) {
    //   console.error('Here is the error message', error);      
    // }
    // return options;
  }


  public static getDefaultHttpHeaders(): HttpHeaders {
    return new HttpHeaders()
      .set(HttpService.HEADER_ACCEPT, 'application/json')
      .set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
  }

  /*private sanitiseOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    options = options || {};
    options.withCredentials = true;

    this.sanitiseHeaders(options);

    return options;
  }

  private sanitiseHeaders(options?: RequestOptionsArgs) {
    if (!options.headers) {
      options.headers = new Headers();
    }

    if (!options.headers.has(HttpService.HEADER_ACCEPT)) {
      options.headers.set(HttpService.HEADER_ACCEPT, 'application/json');
    }
    if (!options.headers.has(HttpService.HEADER_CONTENT_TYPE)) {
      options.headers.set(HttpService.HEADER_CONTENT_TYPE, 'application/json');
    }

    if (null === options.headers.get(HttpService.HEADER_CONTENT_TYPE)) {
      options.headers.delete(HttpService.HEADER_CONTENT_TYPE);
    }
  }*/
}

export interface OptionsType {
  headers?: HttpHeaders;
  observe: 'body';
  params?: HttpParams | { [param: string]: string | string[]; };
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
}
