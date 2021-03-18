import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { ShowCondition } from '../../../directives';
import { CaseEventData, CaseEventTrigger, CaseField, CasePrintDocument, CaseView, Draft, FieldType, FieldTypeEnum } from '../../../domain';
import { HttpErrorService, HttpService, LoadingService, OrderService } from '../../../services';
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

  // Handling of Dynamic Lists in Complex Types
  public static readonly SERVER_RESPONSE_FIELD_TYPE_COLLECTION = 'Collection';
  public static readonly SERVER_RESPONSE_FIELD_TYPE_COMPLEX = 'Complex';
  public static readonly SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST_TYPE: FieldTypeEnum[] = ['DynamicList', 'DynamicMultiSelectList'];

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
    private loadingService: LoadingService
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
      .get(url, {headers, observe: 'body'})
      .pipe(
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        finalize(() => this.loadingService.unregister(loadingToken))
      );
  }

  /**
   * handleNestedDynamicLists()
   * Reassigns list_item and value data to DynamicList children
   * down the tree. Server response returns data only in
   * the `value` object of parent complex type
   *
   * EUI-2530 Dynamic Lists for Elements in a Complex Type
   *
   * @param jsonBody - { case_fields: [ CaseField, CaseField ] }
   */
  private handleNestedDynamicLists(jsonBody: { case_fields: CaseField[] }): any {

    if (jsonBody.case_fields) {
      jsonBody.case_fields.forEach(caseField => {
        if (caseField.field_type) {
          this.setDynamicListDefinition(caseField, caseField.field_type, caseField);
        }
      });
    }

    return jsonBody;
  }

  private setDynamicListDefinition(caseField: CaseField, caseFieldType: FieldType, rootCaseField: CaseField) {
    if (caseFieldType.type === CasesService.SERVER_RESPONSE_FIELD_TYPE_COMPLEX) {

      caseFieldType.complex_fields.forEach(field => {
        try {
          const isDynamicField = CasesService.SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST_TYPE.indexOf(field.field_type.type) !== -1;

          if (isDynamicField) {
            const dynamicListValue = this.getDynamicListValue(rootCaseField.value, field.id);
            if (dynamicListValue) {
              const list_items = dynamicListValue.list_items;
              const value = dynamicListValue.value;
              field.value = {
                list_items: list_items,
                value: value ? value : undefined
              };
              field.formatted_value = {
                ...field.formatted_value,
                ...field.value
              };
            }
          } else {
            this.setDynamicListDefinition(field, field.field_type, rootCaseField);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } else if (caseFieldType.type === CasesService.SERVER_RESPONSE_FIELD_TYPE_COLLECTION) {
      if (caseFieldType.collection_field_type) {
        this.setDynamicListDefinition(caseField, caseFieldType.collection_field_type, rootCaseField);
      }
    }
  }

  private getDynamicListValue(jsonBlock: any, key: string) {

    if (jsonBlock[key]) {
      return jsonBlock[key];
    } else  {
      for (const elementKey in jsonBlock) {
        if (typeof jsonBlock === 'object' && jsonBlock.hasOwnProperty(elementKey)) {
          return this.getDynamicListValue(jsonBlock[elementKey], key);
        }
      }
    }

    return null;
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
      .get(url, {headers, observe: 'body'})
      .pipe(
        map(body => {
          return this.handleNestedDynamicLists(body);
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
      .post(url, eventData, {headers, observe: 'body'})
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
      .post(url, eventData, {headers, observe: 'body'})
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
      .post(url, eventData, {headers, observe: 'body'})
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
      .get(url, {headers, observe: 'body'})
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
    // This is used a feature toggle to
    // control the work allocation
    if (this.appConfig.getWorkAllocationApiUrl()) {
        this.workAllocationService.completeAppropriateTask(caseData.id, eventData.id)
          .subscribe(() => {
            // Success. Do nothing.
          }, error => {
            // Show an appropriate warning about something that went wrong.
            console.warn('Could not process tasks for this case event', error);
          });
    }
  }
}
