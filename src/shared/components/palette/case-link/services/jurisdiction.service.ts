import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Jurisdiction } from '../../../../domain/definition/jurisdiction.model';

@Injectable()
export class JurisdictionService {

  constructor(private readonly http: HttpClient) {}

  public getJurisdictions(): Observable<Jurisdiction[]> {
    const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json'
    });
    return this.http.get<Jurisdiction[]>('/aggregated/caseworkers/:uid/jurisdictions?access=read', {headers});
  }
}
