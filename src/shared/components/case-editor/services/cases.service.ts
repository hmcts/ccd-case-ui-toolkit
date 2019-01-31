import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { plainToClass } from 'class-transformer';
import { Headers } from '@angular/http';
import { OrderService, HttpService, HttpErrorService } from '../../../services';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { catchError, map, tap } from 'rxjs/operators';
import { CaseView, CaseEventTrigger, CaseEventData, CasePrintDocument, Draft, CaseField } from '../../../domain';
import { WizardPage, WizardPageField } from '../domain';
import { ComplexFieldMask } from '../domain/wizard-page-field-complex-mask.model';

@Injectable()
export class CasesService {

  public static readonly V2_MEDIATYPE_CASE_VIEW = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-case-view.v2+json';
  public static readonly V2_MEDIATYPE_START_CASE_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-case-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_START_EVENT_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-event-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_START_DRAFT_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-draft-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_CASE_DATA_VALIDATE =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.case-data-validate.v2+json;charset=UTF-8';

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
    private errorService: HttpErrorService
  ) {}

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

  getEventTrigger(caseTypeId: string,
                  eventTriggerId: string,
                  caseId?: string,
                  ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    let url =  this.buildEventTriggerUrl(caseTypeId, eventTriggerId, caseId, ignoreWarning);

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
        map(response => response.json()),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        }),
        map((p: Object) => plainToClass(CaseEventTrigger, p)),
        tap(eventTrigger => this.initialiseEventTrigger(eventTrigger))
      );
  }

  createEvent(caseDetails: CaseView, eventData: CaseEventData): Observable<object> {
    const jid = caseDetails.case_type.jurisdiction.id;
    const ctid = caseDetails.case_type.id;
    const caseId = caseDetails.case_id;
    const url = this.appConfig.getCaseDataUrl() + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/cases/${caseId}/events`;

    return this.http
      .post(url, eventData)
      .pipe(
        map(response => this.processResponse(response)),
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

  createCase(jid: string, ctid: string, eventData: CaseEventData): Observable<object> {
    let ignoreWarning = 'false';

    if (eventData.ignore_warning) {
      ignoreWarning = 'true';
    }
    const url = this.appConfig.getCaseDataUrl()
      + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/cases?ignore-warning=${ignoreWarning}`;

    return this.http
      .post(url, eventData)
      .pipe(
        map(response => this.processResponse(response)),
        catchError(error => {
          this.errorService.setError(error);
          return throwError(error);
        })
      );
  }

  getPrintDocuments(jurisdictionId: string, caseTypeId: string, caseId: string): Observable<CasePrintDocument[]> {
    const url = this.appConfig.getCaseDataUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types/${caseTypeId}`
      + `/cases/${caseId}`
      + `/documents`;

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

  private processResponse(response) {
    if (response.headers && response.headers.get('content-type').indexOf('application/json') !== -1) {
      return response.json();
    }
    return {'id': ''};
  }

  private initialiseEventTrigger(eventTrigger: CaseEventTrigger) {
    if (!eventTrigger.wizard_pages) {
      eventTrigger.wizard_pages = [];
    }

    eventTrigger.wizard_pages.forEach((wizardPage: WizardPage) => {
      wizardPage.parsedShowCondition = new ShowCondition(wizardPage.show_condition);
      wizardPage.case_fields = wizardPage.wizard_page_fields.map((wizardField: WizardPageField) => {
        return this.wizardPageFieldToCaseFieldMapper(wizardField, eventTrigger.case_fields);
      });
      wizardPage.case_fields = this.deepOrder(wizardPage.case_fields);
    });
  }

  private wizardPageFieldToCaseFieldMapper(wizardPageField: WizardPageField, caseFields: CaseField[]): CaseField {

    let case_field: CaseField = caseFields.find(e => e.id === wizardPageField.case_field_id);
    case_field.id = wizardPageField.case_field_id;
    case_field.wizardProps = wizardPageField;
    case_field.display_context = wizardPageField.display_context;
    case_field.order = wizardPageField.order;

    if (wizardPageField.display_context === 'COMPLEX' && wizardPageField.complex_field_mask_list) {

      wizardPageField.complex_field_mask_list.forEach((complexFieldMask: ComplexFieldMask) => {
        const caseFieldIds = complexFieldMask.complex_field_id.split('.');
        let case_field_leaf: CaseField;

        if (case_field.field_type.type === 'Collection' && case_field.field_type.collection_field_type.type === 'Complex') {
          const [_, ...tail] = caseFieldIds;
          case_field_leaf = this.getCaseFieldLeaf(tail, case_field.field_type.collection_field_type.complex_fields);
        } else {
          case_field_leaf = this.getCaseFieldLeaf(caseFieldIds, caseFields);
        }

        if (complexFieldMask.display_context !== 'HIDDEN') {
          case_field_leaf.hidden = false;
          case_field_leaf.display_context = complexFieldMask.display_context;
          if (complexFieldMask.order) {
            case_field_leaf.order = complexFieldMask.order;
          }
          if (complexFieldMask.label && complexFieldMask.label.length > 0) {
            case_field_leaf.label = complexFieldMask.label;
          }
          if (complexFieldMask.hint_text && complexFieldMask.hint_text.length > 0) {
            case_field_leaf.hint_text = complexFieldMask.hint_text;
          }
          if (complexFieldMask.show_condition && complexFieldMask.show_condition.length > 0) {
            case_field_leaf.show_condition = complexFieldMask.show_condition;
          }
        } else {
          case_field_leaf.hidden = true;
        }
      });
    }

    return case_field;
  }

  private getCaseFieldLeaf(caseFieldId: string[], caseFields: CaseField[]): CaseField {
    const [head, ...tail] = caseFieldId;
    if (caseFieldId.length === 1) {
      let caseLeaf = caseFields.find(e => e.id === head);
      if (!caseLeaf) {
        throw new Error(`Cannot find leaf for caseFieldId ${caseFieldId.join('.')}`);
      }
      return caseLeaf;
    } else if (caseFieldId.length > 1) {
      let caseField = caseFields.find(e => e.id === head);
      if (!caseField.field_type && !caseField.field_type.complex_fields) {
        throw new Error(`field_type or complex_fields missing for ${caseFieldId.join('.')}`);
      }
      let newCaseFields = caseField.field_type.complex_fields;
      return this.getCaseFieldLeaf(tail, newCaseFields)
    } else {
      throw new Error(`Cannot find leaf for caseFieldId ${caseFieldId.join('.')}`);
    }
  }

  private deepOrder(case_fields: CaseField[]): CaseField[] {
    let orderedCaseFields = this.orderService.sort(case_fields);
    orderedCaseFields.forEach((caseField: CaseField) => {
      if (caseField.field_type && caseField.field_type.type === 'Complex') {
        caseField.field_type.complex_fields = this.deepOrder(caseField.field_type.complex_fields);
      }
    });
    return orderedCaseFields;
  }
}
