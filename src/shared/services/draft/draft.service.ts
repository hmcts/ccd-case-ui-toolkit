import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Response, Headers } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService, HttpErrorService } from '../http';
import { CaseEventData, Draft, DRAFT_PREFIX, CaseView } from '../../domain';
import { Headers } from '@angular/http';

@Injectable()
export class DraftService {

<<<<<<< Updated upstream
  public static readonly V2_MEDIATYPE_DRAFT_CREATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-create.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_UPDATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-update.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_READ =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-read.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_DELETE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-delete.v2+json;charset=UTF-8';
=======
  public static readonly V2_MEDIATYPE_DRAFT_READ =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-read.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_CREATE =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-create.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_UPDATE =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-update.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_DRAFT_DELETE =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-draft-delete.v2+json;charset=UTF-8';
>>>>>>> Stashed changes

  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig,
    private errorService: HttpErrorService
  ) {}

<<<<<<< Updated upstream
  createDraft(jid: string, ctid: string, eventData: CaseEventData): Observable<Draft> {
    const url = this.appConfig.getCreateOrUpdateDraftsUrl(jid, ctid);

    const headers = new Headers({
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_CREATE,
      'experimental': 'true',
    });

    return this.http
      .post(url, eventData, {headers})
=======
  createDraft(ctid: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(ctid);
    let headers = new Headers({
      'experimental': 'true',
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_CREATE
    });
    return this.http
      .post(saveDraftEndpoint, eventData, {headers})
>>>>>>> Stashed changes
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      });
  }

<<<<<<< Updated upstream
  updateDraft(jid: string, ctid: string, draftId: string, eventData: CaseEventData): Observable<Draft> {
    const url = this.appConfig.getCreateOrUpdateDraftsUrl(jid, ctid) + draftId;

    const headers = new Headers({
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_UPDATE,
      'experimental': 'true',
    });

    return this.http
      .put(url, eventData, {headers})
=======
  updateDraft(ctid: string, draftId: string, eventData: CaseEventData): Observable<Draft> {
    const saveDraftEndpoint = this.appConfig.getCreateOrUpdateDraftsUrl(ctid) + draftId;
    let headers = new Headers({
      'experimental': 'true',
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_UPDATE
    });
    return this.http
      .put(saveDraftEndpoint, eventData, {headers})
>>>>>>> Stashed changes
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      });
  }

  getDraft(draftId: string): Observable<CaseView> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(draftId.slice(DRAFT_PREFIX.length));
<<<<<<< Updated upstream

    const headers = new Headers({
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_READ,
      'experimental': 'true',
    });

=======
    let headers = new Headers({
      'experimental': 'true',
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_READ
    });
>>>>>>> Stashed changes
    return this.http
      .get(url, {headers})
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      });
  }

  deleteDraft(draftId: string): Observable<{} | Response> {
    const url = this.appConfig.getViewOrDeleteDraftsUrl(draftId.slice(DRAFT_PREFIX.length));
<<<<<<< Updated upstream

    const headers = new Headers({
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_DELETE,
      'experimental': 'true',
    });

=======
    let headers = new Headers({
      'experimental': 'true',
      'Accept': DraftService.V2_MEDIATYPE_DRAFT_DELETE
    });
>>>>>>> Stashed changes
    return this.http
      .delete(url, {headers})
      .catch((error: any): any => {
        this.errorService.setError(error);
        return throwError(error);
      });
  }

  createOrUpdateDraft(caseTypeId: string, draftId: string, caseEventData: CaseEventData): Observable<Draft> {
    if (!draftId) {
      return this.createDraft(caseTypeId, caseEventData);
    } else {
      return this.updateDraft(caseTypeId, Draft.stripDraftId(draftId), caseEventData);
    }
  }
}
