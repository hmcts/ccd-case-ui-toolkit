import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { FlagType } from '../../domain/case-flag';
import { HttpError } from '../../domain/http';
import { HttpErrorService, HttpService } from '../http';
import { RefdataCaseFlagType } from './refdata-case-flag-type.enum';

@Injectable()
export class CaseFlagRefdataService {
  private static readonly CONTENT_TYPE_HEADER = 'Content-Type';
  private static readonly CONTENT_TYPE_APPLICATION_JSON = 'application/json';

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) { }

  public getCaseFlagsRefdata(serviceId: string, flagType?: RefdataCaseFlagType, welshRequired?: boolean): Observable<FlagType[]> {
    let url = this.appConfig.getCaseFlagsRefdataApiUrl();

    if (url) {
      url = url.replace(':sid', serviceId);
      if (flagType) {
        url += `?flag-type=${flagType}`;
      }
      if (welshRequired != null) {
        // Check if flag-type has been added to the query string; if so, append welsh-required with '&'
        url.indexOf('?') > -1 ? url += '&' : url += '?';
        welshRequired ? url += 'welsh-required=Y' : url += 'welsh-required=N';
      }

      const headers = new HttpHeaders().set(
        CaseFlagRefdataService.CONTENT_TYPE_HEADER, CaseFlagRefdataService.CONTENT_TYPE_APPLICATION_JSON);
      return this.http
        .get(url, {headers, observe: 'body'})
        .pipe(
          // Reference Data Common API returns a single object with a "flags" array, which itself contains a single object
          // with a "FlagDetails" array, which contains a hierarchy of flag types in an object - one each for "Party" flags
          // and "Case" flags
          map(body => {
            if (!body || !body.flags || !body.flags.length || !body.flags[0].FlagDetails || !body.flags[0].FlagDetails.length) {
              // Note: Reference Data Common API appears to respond with a 404 error rather than send an empty response,
              // so this may be redundant
              return throwError(new Error('No flag types could be retrieved'));
            }
            return body.flags[0].FlagDetails;
          }),
          catchError((error: HttpError) => {
            this.errorService.setError(error);
            return throwError(error);
          })
        );
    }

    return null;
  }

  /**
   * Retrieves the HMCTS Service Code for a jurisdiction or service. For example, the "SSCS" service has a corresponding
   * service code of "BBA3".
   *
   * @param serviceNames The service name(s) to look up, comma-separated if more than one
   * @returns An `Observable` of the service code
   */
  public getHmctsServiceCode(serviceNames?: string): Observable<string> {
    let url = this.appConfig.getLocationRefApiUrl();

    if (url) {
      url += '/orgServices';
      if (serviceNames) {
        url += `?ccdServiceNames=${serviceNames}`;
      }

      const headers = new HttpHeaders().set(
        CaseFlagRefdataService.CONTENT_TYPE_HEADER, CaseFlagRefdataService.CONTENT_TYPE_APPLICATION_JSON);
      return this.http
        .get(url, {headers, observe: 'body'})
        .pipe(
          map(body => body
          ),
          catchError((error: HttpError) => {
            this.errorService.setError(error);
            return throwError(error);
          })
        );
    }
  }
}
