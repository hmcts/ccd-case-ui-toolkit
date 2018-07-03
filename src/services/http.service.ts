import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';

import 'rxjs/add/operator/catch';

@Injectable()
export class HttpService {

  private static readonly HEADER_ACCEPT = 'Accept';
  private static readonly HEADER_CONTENT_TYPE = 'Content-Type';

  constructor(
    private http: Http
  ) {}

  /**
   *
   * @param url Url resolved using UrlResolverService
   * @param options
   * @returns {Observable<Response>}
   * @see UrlResolverService
   */
  public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.http
      .get(url, this.sanitiseOptions(options));
      // .catch(res => {
      //   console.log(res);
      //   reject();
      // });
  }

  private sanitiseOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
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
  }
}
