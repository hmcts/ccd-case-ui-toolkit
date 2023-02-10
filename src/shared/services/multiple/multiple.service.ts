import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { updateFunctionDeclaration } from 'typescript';
import { v4 as uuid } from 'uuid'

import { AbstractAppConfig } from '../../../app.config';
import { CasesService } from '../../components/case-editor/services';
import { CaseEventData } from '../../domain/case-event-data.model';
import { SearchResultView, SearchResultViewWithTotal } from '../../domain/search';
import { HttpErrorService } from '../http/http-error.service';
import { LoadingService } from '../loading/loading.service';


@Injectable()
export class MultipleService {
  public static readonly FIX_CASE_EVENT_ID = 'fixCaseAPI';
  public static readonly MULTIPLE_AMEND_EVENT_ID = 'amendMultipleDetails';

  constructor(private appConfig: AbstractAppConfig,
    private http: HttpClient, private loadingService: LoadingService) { }

  public async removeCaseFromMultiple(data: MultipleAmendRequest): Promise<void> {
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Content-Type', 'application/json');
    
    data.cases.forEach(async caseId => {
      await this.removeCases(caseId.caseId, headers);     
    });

    //sleep for demo
    await new Promise(f => setTimeout(f, 1000));

    await this.addCases(data.multipleReference, data.cases.map(pair => pair.caseReference), headers);      
  }

  private async removeCases(caseId: string, headers: HttpHeaders) {
    const url = `${this.appConfig.getCaseDataUrl()}/cases/${caseId}/events`;
    let token = await this.getEventToken(caseId, MultipleService.FIX_CASE_EVENT_ID);
    let body = this.createRequestBody(
      token,
      MultipleService.FIX_CASE_EVENT_ID,
      {
        multipleFlag: "No",
        caseType: "Single",
        multipleReference: ""
      });

    this.http.post(url, body, { headers, observe: 'body' }).subscribe();
  }

  private async addCases(multipleId: string, caseReferences: string[], headers: HttpHeaders) {
    const url = `${this.appConfig.getCaseDataUrl()}/cases/${multipleId}/events`;
    let token = await this.getEventToken(multipleId, MultipleService.MULTIPLE_AMEND_EVENT_ID);
    let body = this.createRequestBody(
      token,
      MultipleService.MULTIPLE_AMEND_EVENT_ID,
      {
        typeOfAmendment: [
          "Add cases to multiple"
        ],
        caseIdCollection: caseReferences.map(caseRef => {
          return {
            value: {
              ethos_CaseReference: caseRef
            },
            id: uuid()
          }
        })
      });

    this.http.post(url, body, { headers, observe: 'body' }).subscribe();
  }

  private createRequestBody(eventToken: string, eventId: string, data: object) {
    return {
      data: data,
      event: {
        id: eventId,
        summary: "",
        description: ""
      },
      event_token: eventToken,
      ignore_warning: false
    }
  }

  // private createRequest(eventToken: string) {
  //   return {
  //     data: {
  //       multipleFlag: "No",
  //       caseType: "Single",
  //       multipleReference: ""
  //     },
  //     event: {
  //       id: MultipleService.FIX_CASE_EVENT_ID,
  //       summary: "",
  //       description: ""
  //     },
  //     event_token: eventToken,
  //     ignore_warning: false
  //   }
  // }

  private async getEventToken(caseId: string, eventId: string) {
    const url = `${this.appConfig.getCaseDataUrl()}/cases/${caseId}/event-triggers/${eventId}?ignore-warning=false`;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Content-Type', 'application/json');

    let token = await this.http
      .get(url, { headers, observe: 'body' }).map((resp: CaseEventTriggerRepsonse) => resp.token).toPromise();

    return token;
  }

  // private async getRequestBody(caseid: string) {
  //   const url = `${this.appConfig.getCaseDataUrl()}/cases/${caseid}/event-triggers/fixCaseAPI?ignore-warning=false`;
  //   const headers = new HttpHeaders()
  //     .set('experimental', 'true')
  //     .set('Content-Type', 'application/json');

  //   //const loadingToken = this.loadingService.register();
  //   let token = await this.http
  //     .get(url, { headers, observe: 'body' })
  //     // .pipe(
  //     //   catchError(error => {
  //     //     this.errorService.setError(error);
  //     //     return throwError(error);
  //     //   }),
  //     //   finalize(() => this.loadingService.unregister(loadingToken))
  //     // )
  //     .map((resp: CaseEventTriggerRepsonse) => resp.token).toPromise();

  //   return this.createRequest(token);
  // }
}

export class MultipleAmendRequest {
  multipleReference: string;
  cases: CaseIdPair[];
}
export class CaseIdPair {
  caseId: string;
  caseReference: string;
}

export class CaseEventTriggerRepsonse {
  event_id?: string;
  token: string;
  case_details?: object;
}








