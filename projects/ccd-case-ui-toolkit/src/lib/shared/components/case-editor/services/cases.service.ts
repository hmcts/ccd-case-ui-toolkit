import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../../app.config';
import { ShowCondition } from '../../../directives';
import {
  CaseEventData,
  CaseEventTrigger,
  CasePrintDocument,
  CaseView,
  ChallengedAccessRequest, Draft,
  RoleAssignmentResponse,
  RoleCategory,
  RoleRequestPayload, SpecificAccessRequest
} from '../../../domain';
import { UserInfo } from '../../../domain/user/user-info.model';
import { FieldsUtils, HttpErrorService, HttpService, LoadingService, OrderService, RetryUtil, SessionStorageService } from '../../../services';
import { LinkedCasesResponse } from '../../palette/linked-cases/domain/linked-cases.model';
import { CaseAccessUtils } from '../case-access-utils';
import { WizardPage } from '../domain';
import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';
import { CaseEditUtils } from '../case-edit-utils/case-edit.utils';

@Injectable()
export class CasesService {
  // Internal (UI) API
  public static readonly V2_MEDIATYPE_CASE_VIEW = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-case-view.v2+json';
  public static readonly V2_MEDIATYPE_START_CASE_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-case-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_START_EVENT_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-event-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_START_DRAFT_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-draft-trigger.v2+json;charset=UTF-8';

  // External (Data Store) API

  public static readonly V2_MEDIATYPE_CASE_DOCUMENTS =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.case-documents.v2+json;charset=UTF-8';

  public static readonly V2_MEDIATYPE_CASE_DATA_VALIDATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.case-data-validate.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_CREATE_EVENT =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.create-event.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_CREATE_CASE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.create-case.v2+json;charset=UTF-8';

  public static readonly PUI_CASE_MANAGER = 'pui-case-manager';

  public get = this.getCaseView;

  public static updateChallengedAccessRequestAttributes(httpClient: HttpClient, caseId: string, attributesToUpdate: { [x: string]: any })
    : Observable<RoleAssignmentResponse> {
    return httpClient.post<RoleAssignmentResponse>(`/api/challenged-access-request/update-attributes`, {
      caseId,
      attributesToUpdate
    });
  }

  public static updateSpecificAccessRequestAttributes(httpClient: HttpClient, caseId: string, attributesToUpdate: { [x: string]: any })
    : Observable<RoleAssignmentResponse> {
    return httpClient.post<RoleAssignmentResponse>(`/api/specific-access-request/update-attributes`, {
      caseId,
      attributesToUpdate
    });
  }

  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig,
    private orderService: OrderService,
    private errorService: HttpErrorService,
    private wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper,
    private loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly retryUtil: RetryUtil
  ) {
  }

  public getCaseView(jurisdictionId: string,
    caseTypeId: string,
    caseId: string): Observable<CaseView> {
    const url = `${this.appConfig.getApiUrl()}/caseworkers/:uid/jurisdictions/${jurisdictionId}/case-types/${caseTypeId}/cases/${caseId}`;
    const loadingToken = this.loadingService.register();
    return this.http
      .get(url)
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        finalize(() => this.loadingService.unregister(loadingToken))
      );
  }

  public getCaseViewV2(caseId: string): Observable<CaseView> {
    const url = `${this.appConfig.getCaseDataUrl()}/internal/cases/${caseId}`;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_VIEW)
      .set('Content-Type', 'application/json');
    const loadingToken = this.loadingService.register();

    let http$ = this.http.get(url, { headers, observe: 'body' });

    const artificialDelay: number = this.appConfig.getTimeoutsCaseRetrievalArtificialDelay();
    const timeoutPeriods = this.appConfig.getTimeoutsForCaseRetrieval();
    console.log(`Timeout periods: ${timeoutPeriods} seconds.`);
    if (timeoutPeriods && timeoutPeriods.length > 0 && timeoutPeriods[0] > 0) {
      http$ = this.retryUtil.pipeTimeoutMechanismOn(http$, artificialDelay, timeoutPeriods);
    } else {
      console.warn('Skipping to pipe a retry mechanism!');
    }

    http$ = this.pipeErrorProcessor(http$);

    http$ = http$.pipe(finalize(() => this.finalizeGetCaseViewWith(caseId, loadingToken)));

    return http$;
  }

  private pipeErrorProcessor(in$: Observable<CaseView>): Observable<CaseView> {
    const out$ = in$.pipe(catchError(error => {
      console.error(`Error while getting case view with getCaseViewV2! Error type: '${typeof error}, Error name: '${error?.name}'`);
      console.error(error);
      this.errorService.setError(error);
      return throwError(error);
    }));
    return out$;
  }

  private finalizeGetCaseViewWith(caseId: string, loadingToken: string) {
    this.loadingService.unregister(loadingToken);
  }

  public syncWait(seconds) {
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end) continue;
  }

  public getEventTrigger(caseTypeId: string,
    eventTriggerId: string,
    caseId?: string,
    ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';
    const url = this.buildEventTriggerUrl(caseTypeId, eventTriggerId, caseId, ignoreWarning);

    let headers = new HttpHeaders();
    headers = headers.set('experimental', 'true');
    headers = headers.set('Content-Type', 'application/json');
    headers = this.addClientContextHeader(headers);

    if (Draft.isDraft(caseId)) {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_DRAFT_TRIGGER);
    } else if (caseId !== undefined && caseId !== null) {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_EVENT_TRIGGER);
    } else {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_CASE_TRIGGER);
    }

    return this.http
      .get(url, { headers, observe: 'response' as 'body'})
      .pipe(
        map((response) => {
          this.updateClientContextStorage(response.headers);
          return FieldsUtils.handleNestedDynamicLists(response.body);
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        map((p) => plainToClass(CaseEventTrigger, p)),
        tap(eventTrigger => this.initialiseEventTrigger(eventTrigger))
      );
  }

  public createEvent(caseDetails: CaseView, eventData: CaseEventData): Observable<{}> {
    const caseId = caseDetails.case_id;
    const url = `${this.appConfig.getCaseDataUrl()}/cases/${caseId}/events`;
    let headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_EVENT)
      .set('Content-Type', 'application/json');
    headers = this.addClientContextHeader(headers);
    return this.http
      .post(url, eventData, { headers, observe: 'response' as 'body' })
      .pipe(
        map((response) => {
          this.updateClientContextStorage(response.headers);
          return response.body;
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  public validateCase(ctid: string, eventData: CaseEventData, pageId: string): Observable<object> {
    const pageIdString = pageId ? `?pageId=${pageId}` : '';
    const url = `${this.appConfig.getCaseDataUrl()}/case-types/${ctid}/validate${pageIdString}`;
    let headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DATA_VALIDATE)
      .set('Content-Type', 'application/json');
    headers = this.addClientContextHeader(headers);
    return this.http
      .post(url, eventData, { headers, observe: 'response' as 'body' })
      .pipe(
        map((response) => {
          this.updateClientContextStorage(response.headers);
          return response.body;
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  public createCase(ctid: string, eventData: CaseEventData): Observable<object> {
    let ignoreWarning = 'false';
    if (eventData.ignore_warning) {
      ignoreWarning = 'true';
    }
    const url = `${this.appConfig.getCaseDataUrl()}/case-types/${ctid}/cases?ignore-warning=${ignoreWarning}`;

    let headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_CASE)
      .set('Content-Type', 'application/json');
    headers = this.addClientContextHeader(headers);
    return this.http
      .post(url, eventData, { headers, observe: 'response' as 'body' })
      .pipe(
        map((response) => {
          this.updateClientContextStorage(response.headers);
          return response.body;
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  public getPrintDocuments(caseId: string): Observable<CasePrintDocument[]> {
    const url = `${this.appConfig.getCaseDataUrl()}/cases/${caseId}/documents`;
    let headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DOCUMENTS)
      .set('Content-Type', 'application/json');
    headers = this.addClientContextHeader(headers);
    return this.http
      .get(url, { headers, observe: 'response' as 'body' })
      .pipe(
        map((response) => {
          this.updateClientContextStorage(response.headers);
          return response.body.documentResources;
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  private buildEventTriggerUrl(caseTypeId: string,
    eventTriggerId: string,
    caseId?: string,
    ignoreWarning?: string): string {
    let url = `${this.appConfig.getCaseDataUrl()}/internal`;
    if (Draft.isDraft(caseId)) {
      url += `/drafts/${caseId}`
        + `/event-trigger`
        + `?ignore-warning=${ignoreWarning}`;
    } else if (caseTypeId === undefined || caseTypeId === null) {
      url += `/cases/${caseId}`
        + `/event-triggers/${eventTriggerId}`
        + `?ignore-warning=${ignoreWarning}`;
    } else {
      url += `/case-types/${caseTypeId}`
        + `/event-triggers/${eventTriggerId}`
        + `?ignore-warning=${ignoreWarning}`;
    }

    return url;
  }

  private initialiseEventTrigger(eventTrigger: CaseEventTrigger) {
    if (!eventTrigger.wizard_pages) {
      eventTrigger.wizard_pages = [];
    }

    eventTrigger.wizard_pages.forEach((wizardPage: WizardPage) => {
      wizardPage.parsedShowCondition = ShowCondition.getInstance(wizardPage.show_condition);
      wizardPage.case_fields = this.orderService.sort(
        this.wizardPageFieldToCaseFieldMapper.mapAll(wizardPage.wizard_page_fields, eventTrigger.case_fields));
    });
  }

  public getCourtOrHearingCentreName(locationId: number): Observable<any> {
    return this.http.post(`/api/locations/getLocationsById`, { locations: [{ locationId }] });
  }

  public createChallengedAccessRequest(caseId: string, request: ChallengedAccessRequest): Observable<RoleAssignmentResponse> {
    // Assignment API endpoint
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const camUtils = new CaseAccessUtils();
    let userInfo: UserInfo;
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
    }

    const roleCategory: RoleCategory = userInfo.roleCategory || camUtils.getMappedRoleCategory(userInfo.roles, userInfo.roleCategories);
    const roleName = camUtils.getAMRoleName('challenged', roleCategory);
    const beginTime = new Date();
    const endTime = new Date(new Date().setUTCHours(23, 59, 59, 999));
    const id = userInfo.id ? userInfo.id : userInfo.uid;
    const isNew = true;

    const payload: RoleRequestPayload = camUtils.getAMPayload(id,
      id,
      roleName,
      roleCategory,
      'CHALLENGED',
      caseId,
      request,
      beginTime,
      endTime,
      isNew
    );

    return this.http.post(`/api/challenged-access-request`, payload);
  }

  public createSpecificAccessRequest(caseId: string, sar: SpecificAccessRequest): Observable<RoleAssignmentResponse> {
    // Assignment API endpoint
    const userInfoStr = this.sessionStorageService.getItem('userDetails');

    const camUtils = new CaseAccessUtils();
    let userInfo: UserInfo;
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
    }

    const roleCategory: RoleCategory = userInfo.roleCategory || camUtils.getMappedRoleCategory(userInfo.roles, userInfo.roleCategories);
    const roleName = camUtils.getAMRoleName('specific', roleCategory);
    const id = userInfo.id ? userInfo.id : userInfo.uid;
    const payload: RoleRequestPayload = camUtils.getAMPayload(null, id,
      roleName, roleCategory, 'SPECIFIC', caseId, sar, null, null, true);

    payload.roleRequest = {
      ...payload.roleRequest,
      process: 'specific-access',
      replaceExisting: true,
      assignerId: payload.requestedRoles[0].actorId,
      reference: `${caseId}/${roleName}/${payload.requestedRoles[0].actorId}`
    };

    payload.requestedRoles[0] = {
      ...payload.requestedRoles[0],
      roleName: 'specific-access-requested',
      roleCategory,
      classification: 'PRIVATE',
      endTime: new Date(new Date().setDate(new Date().getDate() + 30)),
      beginTime: null,
      grantType: 'BASIC',
      readOnly: true
    };

    payload.requestedRoles[0].attributes = {
      ...payload.requestedRoles[0].attributes,
      requestedRole: roleName,
      specificAccessReason: sar.specificReason
    };

    payload.requestedRoles[0].notes[0] = {
      ...payload.requestedRoles[0].notes[0],
      userId: payload.requestedRoles[0].actorId
    };

    return this.http.post(
      `/api/specific-access-request`,
      payload
    );
  }

  public getLinkedCases(caseId: string): Observable<LinkedCasesResponse> {
    const url = `${this.appConfig.getCaseDataStoreApiUrl()}/${caseId}`;
    return this.http
      .get(url)
      .pipe(catchError(error => throwError(error)));
  }

  private addClientContextHeader(headers: HttpHeaders): HttpHeaders {
    const clientContextDetails = this.sessionStorageService.getItem('clientContext');
    if (clientContextDetails) {
      let clientContextEdit = JSON.parse(clientContextDetails);
      clientContextEdit.client_context.user_task.task_data.name = 'Review ㅪ the ㋚ appeal \`';
      const caseEditUtils = new CaseEditUtils();
      // below changes non-ASCII characters 
      const editedClientContext = caseEditUtils.editNonASCIICharacters(clientContextDetails);
      const clientContext = window.btoa(editedClientContext);
      if (clientContext) {
        headers = headers.set('Client-Context', clientContext);
      }
    }
    return headers;
  }

  private updateClientContextStorage(headers: HttpHeaders): void {
    if (headers && headers.get('Client-Context')) {
      const caseEditUtils = new CaseEditUtils();
      const clientContextString = window.atob(headers.get('Client-Context'));
      // below reverts non-ASCII characters 
      const editedClientContextString = caseEditUtils.revertEditNonASCIICharacters(clientContextString);
      this.sessionStorageService.setItem('clientContext', editedClientContextString);
    }
  }

}
