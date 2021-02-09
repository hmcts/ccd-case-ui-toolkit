import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { HttpService, HttpErrorService } from '../../../services';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseHistory } from '../domain';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class CaseHistoryService {
  public static readonly V2_MEDIATYPE_CASE_EVENT_VIEW =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-event-view.v2+json;charset=UTF-8';

  constructor(private httpService: HttpService,
              private httpErrorService: HttpErrorService,
              private appConfig: AbstractAppConfig) {}

  get(caseId: string,
      eventId: string): Observable<CaseHistory> {

    const url = this.appConfig.getCaseHistoryUrl(caseId, eventId);

    let headers = new HttpHeaders({
      'experimental': 'true',
      'Accept': CaseHistoryService.V2_MEDIATYPE_CASE_EVENT_VIEW
    });

    return this.httpService
      .get(url, {headers})
      .map(response => response.json())
      .catch((error: any): any => {
        this.httpErrorService.setError(error);
        return Observable.throw(error);
      })
      .map((caseHistory: Object) => plainToClass(CaseHistory, caseHistory));
  }
}
