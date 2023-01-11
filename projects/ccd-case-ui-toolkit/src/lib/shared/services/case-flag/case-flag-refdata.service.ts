import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { FlagType, HmctsServiceDetail } from '../../domain/case-flag';
import { HttpService } from '../http';
import { RefdataCaseFlagType } from './refdata-case-flag-type.enum';

@Injectable()
export class CaseFlagRefdataService {
  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig
  ) { }

  /**
   * Retrieves the Case Flag types for an HMCTS service.
   *
   * @param serviceId The HMCTS Service Code for a jurisdiction or service. **Note:** This is _not_ the service name
   * @param flagType `PARTY` for party-level flags; `CASE` for case-level
   * @param welshRequired `true` if Welsh language versions of flags are required; `false` otherwise (future feature)
   * @returns An `Observable` of an array of flag types
   */
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

      return this.http
        .get(url, {observe: 'body'})
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
          })
        );
    }

    return of(null);
  }

  /**
   * Retrieves the HMCTS service details for a jurisdiction or service, including service code. (For example, the "SSCS"
   * service has a corresponding service code of "BBA3".)
   *
   * @param serviceNames The service name(s) to look up, comma-separated if more than one
   * @returns An `Observable` of an array of service details
   */
  public getHmctsServiceDetails(serviceNames?: string): Observable<HmctsServiceDetail[]> {
    let url = this.appConfig.getLocationRefApiUrl();

    if (url) {
      url += '/orgServices';
      if (serviceNames) {
        url += `?ccdServiceNames=${serviceNames}`;
      }

      return this.http.get(url, {observe: 'body'});
    }

    return of(null);
  }
}
