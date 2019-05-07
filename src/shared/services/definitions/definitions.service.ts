import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../http/http.service';
import { CaseTypeLite, Jurisdiction } from '../../domain';
import { AbstractAppConfig as AppConfig } from '../../../app.config';

@Injectable()
export class DefinitionsService {

  constructor(private http: HttpService, private appConfig: AppConfig) {}

  getCaseTypes(jurisdictionId: string, access: string): Observable<CaseTypeLite[]> {
    const url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types?access=${access}`;

    return this.http
      .get(url)
      .map(response => response.json());
  }

  getJurisdictions(access: string): Observable<Jurisdiction[]> {
    const url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions?access=${access}`;

    return this.http
      .get(url)
      .map(response => response.json());
  }
}
