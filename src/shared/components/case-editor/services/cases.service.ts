import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { plainToClass } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { ShowCondition } from '../../../directives';
import { CaseEventData, CaseEventTrigger, CasePrintDocument, CaseView, Draft, Profile } from '../../../domain';
import { HttpErrorService, HttpService, OrderService } from '../../../services';
import { WizardPage } from '../domain';
import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';

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

  // Handling of Dynamic Lists in Complex Types
  public static readonly SERVER_RESPONSE_FIELD_TYPE_COMPLEX = 'Complex';
  public static readonly SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST = 'DynamicList';

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
    private wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper
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

    return this.http
      .get(url)
      .pipe(
        map(response => response.json()),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  getCaseViewV2(caseId: string): Observable<CaseView> {
    const url = `${this.appConfig.getCaseDataUrl()}/internal/cases/${caseId}`;
    const headers = new Headers({
      'Accept': CasesService.V2_MEDIATYPE_CASE_VIEW,
      'experimental': 'true',
    });

    return this.http
      .get(url, {headers})
      .pipe(
        map(response => response.json()),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  /**
   * handleNestedDynamicListsInComplexTypes()
   * Reassigns list_item and value data to DymanicList children
   * down the tree. Server response returns data only in
   * the `value` object of parent complex type
   *
   * EUI-2530 Dynamic Lists for Elements in a Complex Type
   *
   * @param jsonResponse - {}
   */
  private handleNestedDynamicListsInComplexTypes(jsonResponse) {

    if (jsonResponse.case_fields) {
      jsonResponse.case_fields.forEach(caseField => {
        if (caseField.field_type && caseField.field_type.type === CasesService.SERVER_RESPONSE_FIELD_TYPE_COMPLEX) {

          caseField.field_type.complex_fields.forEach(field => {

            if (field.field_type.type === CasesService.SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST) {
              const list_items = caseField.value[field.id].list_items;
              const value = caseField.value[field.id].value;
              field.value = {
                list_items: list_items,
                value: value ? value : undefined
              };
              field.formatted_value = field.value;
            }
          });
        }
      });
    }

    return jsonResponse;
  }

  getEventTrigger(caseTypeId: string,
                  eventTriggerId: string,
                  caseId?: string,
                  ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    let url = this.buildEventTriggerUrl(caseTypeId, eventTriggerId, caseId, ignoreWarning);

    let headers = new Headers({
      'experimental': 'true'
    });
    if (Draft.isDraft(caseId)) {
      headers.set('Accept', CasesService.V2_MEDIATYPE_START_DRAFT_TRIGGER);
    } else if (caseId !== undefined && caseId !== null) {
      headers.set('Accept', CasesService.V2_MEDIATYPE_START_EVENT_TRIGGER);
    } else {
      headers.set('Accept', CasesService.V2_MEDIATYPE_START_CASE_TRIGGER);
    }

    return this.http
      .get(url, {headers})
      .pipe(
        map(response => {

          return this.handleNestedDynamicListsInComplexTypes(response.json());
        }),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        map((p: Object) => plainToClass(CaseEventTrigger, p)),
        tap(eventTrigger => this.initialiseEventTrigger(eventTrigger))
      );
  }

  createEvent(caseDetails: CaseView, eventData: CaseEventData, profile?: Profile): Observable<object> {
    const caseId = caseDetails.case_id;
    const url = this.appConfig.getCaseDataUrl() + `/cases/${caseId}/events`;

    let headers = new Headers({
      'experimental': 'true',
      'Accept': CasesService.V2_MEDIATYPE_CREATE_EVENT
    });

    return this.http
      .post(url, eventData, {headers})
      .pipe(
        map(response => this.processResponse(response, eventData, profile)),
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

    let headers = new Headers({
      'experimental': 'true',
      'Accept': CasesService.V2_MEDIATYPE_CASE_DATA_VALIDATE
    });

    return this.http
      .post(url, eventData, {headers})
      .pipe(
        map(response => response.json()),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  createCase(ctid: string, eventData: CaseEventData, profile?: Profile): Observable<object> {
    let ignoreWarning = 'false';

    if (eventData.ignore_warning) {
      ignoreWarning = 'true';
    }
    const url = this.appConfig.getCaseDataUrl()
      + `/case-types/${ctid}/cases?ignore-warning=${ignoreWarning}`;

    let headers = new Headers({
      'experimental': 'true',
      'Accept': CasesService.V2_MEDIATYPE_CREATE_CASE
    });

    return this.http
      .post(url, eventData, {headers})
      .pipe(
        map(response => this.processResponse(response, eventData, profile)),
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

    let headers = new Headers({
      'experimental': 'true',
      'Accept': CasesService.V2_MEDIATYPE_CASE_DOCUMENTS
    });

    return this.http
      .get(url, {headers})
      .pipe(
        map(response => response.json().documentResources),
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

  private processResponse(response: any, eventData: CaseEventData, profile: Profile) {
    if (response.headers && response.headers.get('content-type').match(/application\/.*json/)) {
      // TODO: Handle associated tasks.
      const json = response.json();
      this.processTasksOnSuccess(json, eventData.event, profile);
      return json;
    }
    return {'id': ''};
  }

  private initialiseEventTrigger(eventTrigger: CaseEventTrigger) {
    if (!eventTrigger.wizard_pages) {
      eventTrigger.wizard_pages = [];
    }

    eventTrigger.wizard_pages.forEach((wizardPage: WizardPage) => {
      wizardPage.parsedShowCondition = new ShowCondition(wizardPage.show_condition);
      wizardPage.case_fields = this.orderService.sort(
        this.wizardPageFieldToCaseFieldMapper.mapAll(wizardPage.wizard_page_fields, eventTrigger.case_fields));
    });
  }

  private processTasksOnSuccess(caseData: any, eventData: any, profile: Profile): void {
    const user = profile && profile.user && profile.user.idam ? profile.user.idam.id : null;
    /**
     * Retrieve all tasks, which are:
     *   * For the current case;
     *   * Can be completed (status is not "Completed" or "Cancelled");
     *   * Can be completed by the current event;
     *   * Are assigned to the current user.
     */
    const taskSearchParameter: any = {
      ccdId: caseData.id,
      eventId: eventData.id,
      state: [ 'Open' ] // Need to know which are the "completeable" statuses.
    };
    if (user) {
      taskSearchParameter.user = [ user ];
    }

    // Now get the tasks using those properties.
    this.getWorkAllocationTasks([ taskSearchParameter ]).subscribe((tasks: any[]) => {
      console.log('Got tasks', tasks);
      if (tasks && tasks.length > 0) {
        if (tasks.length === 1) {
          // TODO: Attempt to mark this task as complete.
          // If this fails, flag it as an error.
        } else {
          // TODO: This is a problem. We need to flag it up as an error.
        }
      }
      // If we didn't get any tasks back, we're all good. Nothing to see here.
    });
  }

  public getWorkAllocationTasks(taskSearchParameters: any[]): Observable<object> {
    // TODO: Put this in a WorkAllocationService.
    console.log('Find tasks that match this:', taskSearchParameters);
    const url = `${this.appConfig.getWorkAllocationApiUrl()}/task`;
    return this.http
      .post(url, { searchRequest: taskSearchParameters })
      .pipe(
        map(response => response.json()),
        catchError(error => {
          console.log('caught error for getting work allocation tasks', error);
          // this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

}
