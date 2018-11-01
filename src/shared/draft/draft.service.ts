import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Response } from '@angular/http';
import { AbstractAppConfig } from '../../app.config';
import { HttpService, HttpErrorService } from '../http';
import { CaseEventData, Draft, DRAFT_PREFIX, CaseView } from '../domain';

@Injectable()
export class DraftService {
  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig,
    private errorService: HttpErrorService
  ) {}

  createDraft(jid: string, ctid: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(jid, ctid, eventData);
    return this.http
      .post(saveDraftEndpoint, eventData)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  updateDraft(jid: string, ctid: string, draftId: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(jid, ctid, eventData) + draftId;
    return this.http
      .put(saveDraftEndpoint, eventData)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  getDraft(jid: string, ctid: string, draftId: string): Observable<CaseView> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(jid, ctid, draftId.slice(DRAFT_PREFIX.length));
    return this.http
      .get(url)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  deleteDraft(jid: string, ctid: string, draftId: string): Observable<{} | Response> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(jid, ctid, draftId.slice(DRAFT_PREFIX.length));
    return this.http
      .delete(url)
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  createOrUpdateDraft(jurisdictionId: string, caseTypeId: string, draftId: string, caseEventData: CaseEventData): Observable<Draft> {
    if (!draftId) {
      return this.createDraft(jurisdictionId, caseTypeId, caseEventData);
    } else {
      return this.updateDraft(jurisdictionId, caseTypeId, Draft.stripDraftId(draftId), caseEventData);
    }
  }
}
