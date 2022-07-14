import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { CaseEventData, CaseView, Draft, DRAFT_PREFIX } from '../../domain';
import { HttpErrorService, HttpService } from '../http';

@Injectable()
export class DraftService {

  public static readonly V2_MEDIATYPE_DRAFT_CREATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-create.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_UPDATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-update.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_READ =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-read.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_DELETE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-delete.v2+json;charset=UTF-8';

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly errorService: HttpErrorService
  ) {}

  public createDraft(ctid: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(ctid);
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', DraftService.V2_MEDIATYPE_DRAFT_CREATE)
      .set('Content-Type', 'application/json');
    return this.http
      .post(saveDraftEndpoint, eventData, {headers, observe: 'body'})
      .pipe(catchError((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      }));
  }

  public updateDraft(ctid: string, draftId: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(ctid) + draftId;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', DraftService.V2_MEDIATYPE_DRAFT_UPDATE)
      .set('Content-Type', 'application/json');
    return this.http
      .put(saveDraftEndpoint, eventData, {headers, observe: 'body'})
      .pipe(catchError((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      }));
  }

  public getDraft(draftId: string): Observable<CaseView> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(draftId.slice(DRAFT_PREFIX.length));
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', DraftService.V2_MEDIATYPE_DRAFT_READ)
      .set('Content-Type', 'application/json');
    return this.http
      .get(url, {headers, observe: 'body'})
      .pipe(
        catchError((error: any): any => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  public deleteDraft(draftId: string): Observable<{} | any> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(draftId.slice(DRAFT_PREFIX.length));
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', DraftService.V2_MEDIATYPE_DRAFT_DELETE)
      .set('Content-Type', 'application/json');
    return this.http
      .delete(url, {headers, observe: 'body'}).pipe(
        catchError((error: any): any => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  public createOrUpdateDraft(caseTypeId: string, draftId: string, caseEventData: CaseEventData): Observable<Draft> {
    if (!draftId) {
      return this.createDraft(caseTypeId, caseEventData);
    } else {
      return this.updateDraft(caseTypeId, Draft.stripDraftId(draftId), caseEventData);
    }
  }
}
