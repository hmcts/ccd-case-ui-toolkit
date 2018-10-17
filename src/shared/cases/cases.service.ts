import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../app.config';
import { plainToClass } from 'class-transformer';
import { Headers } from '@angular/http';
import { HttpService, HttpErrorService } from '../http';
import { OrderService, CaseView, CaseEventTrigger, CaseEventData, CasePrintDocument, WizardPage, WizardPageField, Draft } from '../domain';
import { ShowCondition } from '../conditional-show';

@Injectable()
export class CasesService {

  public static readonly V2_MEDIATYPE_CASE_VIEW = 'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-case-view.v2+json';

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
    // console.log('retrieving case');
    const url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types/${caseTypeId}`
      + `/cases/${caseId}`;

    return this.http
      .get(url)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  getCaseViewV2(caseId: string): Observable<CaseView> {
    const url = `${this.appConfig.getCaseDataUrl()}/internal/cases/${caseId}`;
    const headers = new Headers({
      'Accept': CasesService.V2_MEDIATYPE_CASE_VIEW,
      'experimental': 'true',
    });

    return this.http
      .get(url, {headers})
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  getEventTrigger(jurisdictionId: string,
                  caseTypeId: string,
                  eventTriggerId: string,
                  caseId?: string,
                  ignoreWarning?: string): Observable<CaseEventTrigger> {
    // console.log('retrieve event trigger');
    ignoreWarning = undefined !== ignoreWarning ? ignoreWarning : 'false';

    let url =  this.buildEventTriggerUrl(jurisdictionId, caseTypeId, eventTriggerId, caseId, ignoreWarning);

    return this.http
      .get(url)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      })
      .map((p: Object) => plainToClass(CaseEventTrigger, p))
      .do(eventTrigger => this.initialiseEventTrigger(eventTrigger));
  }

  createEvent(caseDetails: CaseView, eventData: CaseEventData): Observable<object> {
    const jid = caseDetails.case_type.jurisdiction.id;
    const ctid = caseDetails.case_type.id;
    const caseId = caseDetails.case_id;
    const url = this.appConfig.getCaseDataUrl() + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/cases/${caseId}/events`;

    return this.http
      .post(url, eventData)
      .map(response => this.processResponse(response))
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  validateCase(jid: string, ctid: string, eventData: CaseEventData): Observable<object> {
    const url = this.appConfig.getCaseDataUrl()
      + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/validate`;

    return this.http
      .post(url, eventData)
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
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
      .map(response => this.processResponse(response))
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
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
      .map(response => response.json())
      .catch((error: any): any => {
        this.errorService.setError(error);
        return Observable.throw(error);
      });
  }

  private buildEventTriggerUrl(jurisdictionId: string,
                              caseTypeId: string,
                              eventTriggerId: string,
                              caseId?: string,
                              ignoreWarning?: string): string {
    let url = this.appConfig.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types/${caseTypeId}`;

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
    if (response.headers && response.headers.get('content-type') === 'application/json;charset=UTF-8') {
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
