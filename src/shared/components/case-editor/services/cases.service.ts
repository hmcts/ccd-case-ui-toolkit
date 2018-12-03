import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { plainToClass } from 'class-transformer';
import { Headers } from '@angular/http';
import { OrderService, HttpService, HttpErrorService } from '../../../services';
import { ShowCondition } from '../../../directives/conditional-show/domain/conditional-show.model';
import { catchError, map, tap } from 'rxjs/operators';
import { CaseView, CaseEventTrigger, CaseEventData, CasePrintDocument, Draft } from '../../../domain';
import { WizardPage, WizardPageField } from '../domain';

@Injectable()
export class CasesService {

  public static readonly V2_MEDIATYPE_CASE_VIEW = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-case-view.v2+json';
  public static readonly V2_MEDIATYPE_START_CASE_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-case-trigger.v2+json;charset=UTF-8';
  public static readonly V2_MEDIATYPE_START_EVENT_TRIGGER =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-start-event-trigger.v2+json;charset=UTF-8';

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

  getEventTrigger(jurisdictionId: string,
                  caseTypeId: string,
                  eventTriggerId: string,
                  caseId?: string,
                  ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    let url =  this.buildEventTriggerUrl(this.appConfig.getApiUrl(), caseTypeId, eventTriggerId, caseId, ignoreWarning, jurisdictionId);

    return this.http
      .get(url)
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

  getEventTriggerV2(caseTypeId: string,
                    eventTriggerId: string,
                    caseId?: string,
                    ignoreWarning?: string): Observable<CaseEventTrigger> {
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    let url =  this.buildEventTriggerUrl(this.appConfig.getCaseDataUrl() + '/internal', caseTypeId, eventTriggerId, caseId, ignoreWarning);

    let headers = new Headers({
      'experimental': 'true'
    });
    if (caseId !== undefined && caseId !== null) {
      headers.set('Accpet', CasesService.V2_MEDIATYPE_START_CASE_TRIGGER);
    } else {
      headers.set('Accpet', CasesService.V2_MEDIATYPE_START_EVENT_TRIGGER);
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

  validateCase(jid: string, ctid: string, eventData: CaseEventData, pageId: string): Observable<object> {
    const pageIdString = pageId ? '?pageId=' + pageId : '';
    const url = this.appConfig.getCaseDataUrl()
      + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/validate${pageIdString}`;

    return this.http
      .post(url, eventData)
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

  private buildEventTriggerUrl(baseUrl: string,
                               caseTypeId: string,
                               eventTriggerId: string,
                               caseId?: string,
                               ignoreWarning?: string,
                               jurisdictionId?: string): string {
    let url = baseUrl;
    if (jurisdictionId === undefined || jurisdictionId === null) {
      url += `/case-types/${caseTypeId}`;
    } else {
      url += `/caseworkers/:uid`
        + `/jurisdictions/${jurisdictionId}`
        + `/case-types/${caseTypeId}`;
    }

    if (caseId === undefined || caseId === null) {
      url += `/event-triggers/${eventTriggerId}`
        + `?ignore-warning=${ignoreWarning}`;
    } else if (Draft.isDraft(caseId)) {
      url += `/drafts/${caseId}`
        + `/event-triggers/${eventTriggerId}`
        + `?ignore-warning=${ignoreWarning}`
    } else {
      url += `/cases/${caseId}`
        + `/event-triggers/${eventTriggerId}`
        + `?ignore-warning=${ignoreWarning}`
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
    /* FIXME: find a better place for this code */
    eventTrigger.wizard_pages.forEach((wizardPage: WizardPage) => {
      wizardPage.parsedShowCondition = new ShowCondition(wizardPage.show_condition);
      let orderedWPFields = this.orderService.sort(wizardPage.wizard_page_fields);
      wizardPage.case_fields = orderedWPFields.map((wizardField: WizardPageField) => {
        let case_field = eventTrigger.case_fields.find(cf => cf.id === wizardField.case_field_id);
        case_field.wizardProps = wizardField;
        return case_field;
      });
    });
  }
}
