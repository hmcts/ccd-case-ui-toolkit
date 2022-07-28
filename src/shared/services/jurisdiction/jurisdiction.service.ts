import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Subject } from 'rxjs/Subject';
import { Jurisdiction } from '../../domain';
import { SessionStorageService } from '../session/session-storage.service';

@Injectable()
export class JurisdictionService {

  constructor(private readonly http: HttpClient, private readonly sessionStorageService: SessionStorageService) {}

  private selectedJurisdictionSource = new Subject<Jurisdiction>();

  selectedJurisdiction = this.selectedJurisdictionSource.asObservable();

  announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

  public getJurisdictions(): Observable<Jurisdiction[]> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json'
    });
    if (this.sessionStorageService.getItem('JURISDICTIONS')) {
        const jurisdictions = JSON.parse(this.sessionStorageService.getItem('JURISDICTIONS'));
        return of(jurisdictions as Jurisdiction[]);
    }
    return this.http.get<Jurisdiction[]>('/aggregated/caseworkers/:uid/jurisdictions?access=read', {headers});
  }
}
