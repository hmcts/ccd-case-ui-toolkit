import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { ShowCondition } from '../../../directives';
import {
  CaseEventData,
  CaseEventTrigger,
  CaseField,
  CasePrintDocument,
  CaseView,
  ChallengedAccessRequest,
  SpecificAccessRequest,
  Draft,
  FieldType,
  FieldTypeEnum,
  RoleAssignmentResponse,
  RoleCategory,
  RoleRequestPayload
} from '../../../domain';
import { LinkCaseReason } from '../../palette/linked-cases/domain/linked-case.model';
import { UserInfo } from '../../../domain/user/user-info.model';
import { FieldsUtils, HttpErrorService, HttpService, LoadingService, OrderService, SessionStorageService } from '../../../services';
import { CaseAccessUtils } from '../case-access-utils';
import { WizardPage } from '../domain';
import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';
import { WorkAllocationService } from './work-allocation.service';

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

  /**
   *
   * @type {(caseId:string)=>"../../Observable".Observable<Case>}
   * @deprecated Use `CasesService::getCaseView` instead
   */
  get = this.getCaseView;

  constructor(
    private http: HttpService,
    private appConfig: AbstractAppConfig,
    private orderService: OrderService,
    private errorService: HttpErrorService,
    private wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper,
    private readonly workAllocationService: WorkAllocationService,
    private loadingService: LoadingService,
    private readonly sessionStorageService: SessionStorageService
  ) {
  }

  getCaseView(jurisdictionId: string,
    caseTypeId: string,
    caseId: string): Observable<CaseView> {
    const url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types/${caseTypeId}`
      + `/cases/${caseId}`;

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

  getCaseViewV2(caseId: string): Observable<CaseView> {
    const url = `${this.appConfig.getCaseDataUrl()}/internal/cases/${caseId}`;
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_VIEW)
      .set('Content-Type', 'application/json');

    const loadingToken = this.loadingService.register();
    return this.http
      .get(url, { headers, observe: 'body' })
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        finalize(() => this.loadingService.unregister(loadingToken))
      );
  }

  getCaseLinkResponses(): Observable<LinkCaseReason[]> {
    const linkCaseReasons: LinkCaseReason[] = [
      {
        key: 'progressed',
        value_en: 'Progressed as part of this lead case',
        value_cy: '',
        hint_text_en: 'Progressed as part of this lead case',
        hint_text_cy: '',
        lov_order: 1,
        parent_key: null,
        category_key: 'caseLinkReason',
        parent_category: '',
        active_flag: 'Y',
        child_nodes: null,
        from: 'exui-default',
      },
      {
        key: 'bail',
        value_en: 'Bail',
        value_cy: '',
        hint_text_en: 'Bail',
        hint_text_cy: '',
        lov_order: 2,
        parent_key: null,
        category_key: 'caseLinkReason',
        parent_category: '',
        active_flag: 'Y',
        child_nodes: null,
        from: 'exui-default',
      },
      {
        key: 'other',
        value_en: 'Other',
        value_cy: '',
        hint_text_en: 'Other',
        hint_text_cy: '',
        lov_order: 3,
        parent_key: null,
        category_key: 'caseLinkReason',
        parent_category: '',
        active_flag: 'Y',
        child_nodes: null,
        from: 'exui-default',
      },
    ];
    return of(linkCaseReasons);
  }

  getEventTrigger(caseTypeId: string,
    eventTriggerId: string,
    caseId?: string,
    ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    const url = this.buildEventTriggerUrl(caseTypeId, eventTriggerId, caseId, ignoreWarning);

    let headers = new HttpHeaders()
    headers = headers.set('experimental', 'true')
    headers = headers.set('Content-Type', 'application/json');

    if (Draft.isDraft(caseId)) {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_DRAFT_TRIGGER);
    } else if (caseId !== undefined && caseId !== null) {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_EVENT_TRIGGER);
    } else {
      headers = headers.set('Accept', CasesService.V2_MEDIATYPE_START_CASE_TRIGGER);
    }

    return this.http
      .get(url, { headers, observe: 'body' })
      .pipe(
        map(body => {
          return FieldsUtils.handleNestedDynamicLists(body);
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        map((p: Object) => plainToClass(CaseEventTrigger, p)),
        tap(eventTrigger => this.initialiseEventTrigger(eventTrigger))
      );
  }

  createEvent(caseDetails: CaseView, eventData: CaseEventData): Observable<object> {
    const caseId = caseDetails.case_id;
    const url = this.appConfig.getCaseDataUrl() + `/cases/${caseId}/events`;

    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_EVENT)
      .set('Content-Type', 'application/json');

    return this.http
      .post(url, eventData, { headers, observe: 'body' })
      .pipe(
        map(body => this.processResponseBody(body, eventData)),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  validateCase(ctid: string, eventData: CaseEventData, pageId: string): Observable<object> {
    const pageIdString = pageId ? '?pageId=' + pageId : '';
    const url = this.appConfig.getCaseDataUrl()
      + `/case-types/${ctid}/validate${pageIdString}`;

    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DATA_VALIDATE)
      .set('Content-Type', 'application/json');

    return this.http
      .post(url, eventData, { headers, observe: 'body' })
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  createCase(ctid: string, eventData: CaseEventData): Observable<object> {
    let ignoreWarning = 'false';

    if (eventData.ignore_warning) {
      ignoreWarning = 'true';
    }
    const url = this.appConfig.getCaseDataUrl()
      + `/case-types/${ctid}/cases?ignore-warning=${ignoreWarning}`;

    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_CASE)
      .set('Content-Type', 'application/json');

    return this.http
      .post(url, eventData, { headers, observe: 'body' })
      .pipe(
        map(body => this.processResponseBody(body, eventData)),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  getPrintDocuments(caseId: string): Observable<CasePrintDocument[]> {
    const url = this.appConfig.getCaseDataUrl()
      + `/cases/${caseId}`
      + `/documents`;

    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DOCUMENTS)
      .set('Content-Type', 'application/json');

    return this.http
      .get(url, { headers, observe: 'body' })
      .pipe(
        map(body => body.documentResources),
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
    let url = this.appConfig.getCaseDataUrl() + `/internal`;

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

  private processResponseBody(body: any, eventData: CaseEventData): any {
    this.processTasksOnSuccess(body, eventData.event);
    return body;
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

  private processTasksOnSuccess(caseData: any, eventData: any): void {
    // The following code is work allocation 1 related
    if (this.appConfig.getWorkAllocationApiUrl().toLowerCase() === 'workallocation') {
      // This is used a feature toggle to
      // control the work allocation
      if (!this.isPuiCaseManager()) {
        this.workAllocationService.completeAppropriateTask(caseData.id, eventData.id, caseData.jurisdiction, caseData.case_type)
          .subscribe(() => {
            // Success. Do nothing.
          }, error => {
            // Show an appropriate warning about something that went wrong.
            console.warn('Could not process tasks for this case event', error);
          });
      }
    }
  }

  /*
  Checks if the user has role of pui-case-manager and returns true or false
  */
  private isPuiCaseManager(): boolean {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (userInfoStr) {
      const userInfo: UserInfo = JSON.parse(userInfoStr);
      return userInfo && userInfo.roles && (userInfo.roles.indexOf(CasesService.PUI_CASE_MANAGER) !== -1);
    }
    return false;
  }

  public getCourtOrHearingCentreName(locationId: number): Observable<any> {
    return this.http.get(`${this.appConfig.getLocationRefApiUrl()}/building-locations?epimms_id=${locationId}`);
  }

  public createChallengedAccessRequest(caseId: string, car: ChallengedAccessRequest): Observable<RoleAssignmentResponse> {
    // Assignment API endpoint
    const userInfoStr = this.sessionStorageService.getItem('userDetails');

    const camUtils = new CaseAccessUtils();
    let userInfo: UserInfo;
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
    }

    const roleCategory: RoleCategory = camUtils.getMappedRoleCategory(userInfo.roles, userInfo.roleCategories);
    const roleName = camUtils.getAMRoleName('challenged', roleCategory);
    const beginTime = new Date();
    const endTime = new Date(new Date().setUTCHours(23, 59, 59, 999));

    const payload: RoleRequestPayload = camUtils.getAMPayload(userInfo.id, userInfo.id, roleName, roleCategory,
      'CHALLENGED', caseId, car, beginTime, endTime);

    return this.http.post(`${this.appConfig.getCamRoleAssignmentsApiUrl()}/challenged`, payload);
  }

  public createSpecificAccessRequest(caseId: string, sar: SpecificAccessRequest): Observable<RoleAssignmentResponse> {
    // Assignment API endpoint
    const userInfoStr = this.sessionStorageService.getItem('userDetails');

    const camUtils = new CaseAccessUtils();
    let userInfo: UserInfo;
    if (userInfoStr) {
      userInfo = JSON.parse(userInfoStr);
    }

    const roleCategory: RoleCategory = camUtils.getMappedRoleCategory(userInfo.roles, userInfo.roleCategories);
    const roleName = camUtils.getAMRoleName('specific', roleCategory);

    const payload: RoleRequestPayload = camUtils.getAMPayload(null, userInfo.id,
      roleName, roleCategory, 'SPECIFIC', caseId, sar);

    return this.http.post(`${this.appConfig.getCamRoleAssignmentsApiUrl()}/specific`, payload);
  }

}
