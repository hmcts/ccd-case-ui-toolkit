import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { HttpService } from '../http/http.service';

@Injectable()
export class DefinitionsService {
  constructor(private readonly http: HttpService, private readonly appConfig: AppConfig) {}

  public getCaseTypes(jurisdictionId: string, access: string): Observable<CaseTypeLite[]> {
    const url = `${this.appConfig.getApiUrl()}/caseworkers/:uid/jurisdictions/${jurisdictionId}/case-types?access=${access}`;

    return this.http
      .get(url).pipe(map(response => response));
  }

  public getJurisdictions(access: string): Observable<Jurisdiction[]> {
    const url = `${this.appConfig.getApiUrl()}/caseworkers/:uid/jurisdictions?access=${access}`;

    return this.http
      .get(url)
      .pipe(map(response => response));
  }
}
