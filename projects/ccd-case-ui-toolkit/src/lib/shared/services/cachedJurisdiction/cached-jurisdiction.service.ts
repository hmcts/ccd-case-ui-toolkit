import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { HttpService } from '../http/http.service';
import { SessionStorageService } from '../session/session-storage.service';

@Injectable()
export class CachedJurisdictionService {
  constructor(private readonly httpService: HttpService, private readonly sessionStorageService: SessionStorageService) { }

  public getCachedJurisdictions(endpointUrl: string): Observable<Jurisdiction[]> {
    // Return the cached jurisdictions (as an Observable) from session storage if they exist
    if (this.sessionStorageService.getItem(endpointUrl)) {
      return of(JSON.parse(this.sessionStorageService.getItem(endpointUrl)));
    } else {
      return this.httpService.get(endpointUrl).pipe(
        // Cache the jurisdictions in session storage if they don't exist
        tap((jurisdictions) => this.sessionStorageService.setItem(endpointUrl, JSON.stringify(jurisdictions)))
      );
    }
  }
}
