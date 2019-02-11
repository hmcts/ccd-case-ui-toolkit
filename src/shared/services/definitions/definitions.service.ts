import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { HttpService } from '../http/http.service';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { map } from 'rxjs/operators';

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
      .pipe(map(response => response.json()));
  }

  getJurisdictions(access: string): Observable<Jurisdiction[]> {
    const url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions?access=${access}`;

    return this.http
      .get(url)
      .pipe(map(response => response.json()));
  }
}
