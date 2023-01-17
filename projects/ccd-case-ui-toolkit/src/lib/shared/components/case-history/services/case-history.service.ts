import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpErrorService } from '../../../services/http/http-error.service';
import { HttpService } from '../../../services/http/http.service';
import { CaseHistory } from '../domain/case-history.model';

@Injectable()
export class CaseHistoryService {
  public static readonly V2_MEDIATYPE_CASE_EVENT_VIEW =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-event-view.v2+json;charset=UTF-8';

  constructor(private readonly httpService: HttpService,
              private readonly httpErrorService: HttpErrorService,
              private readonly appConfig: AbstractAppConfig) {}

  public get(caseId: string, eventId: string): Observable<CaseHistory> {
    const url = this.appConfig.getCaseHistoryUrl(caseId, eventId);
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CaseHistoryService.V2_MEDIATYPE_CASE_EVENT_VIEW)
      .set('Content-Type', 'application/json');

    return this.httpService
      .get(url, {headers, observe: 'body'})
      .pipe(
        map((caseHistory: object) => plainToClass(CaseHistory, caseHistory)),
        catchError(
        (error: any): any => {
          this.httpErrorService.setError(error);
          return throwError(error);
        }
      )) as Observable<CaseHistory>;
  }
}
