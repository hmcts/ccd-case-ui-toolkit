import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AbstractAppConfig, CaseEditorConfig, CaseEventData } from '@hmcts/ccd-case-ui-toolkit';

@Injectable()
export class AppConfig extends AbstractAppConfig {

  protected config: CaseEditorConfig = {
    'api_url': '/aggregated',
    'case_data_url': '/data',
    'document_management_url': '/documents',
    'login_url': '/login',
    'oauth2_client_id': 'ccd_gateway',
    'postcode_lookup_url': '/addresses?postcode=${postcode}',
    'remote_document_management_url': '/documents',
    'payments_url': '/payments'
  };

  constructor(private http: Http) {
    super();
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public getLoginUrl(): string {
    return this.config.login_url;
  }

  public getApiUrl() {
    return this.config.api_url;
  }

  public getCaseDataUrl() {
    return this.config.case_data_url;
  }

  public getDocumentManagementUrl() {
    return this.config.document_management_url;
  }

  public getRemoteDocumentManagementUrl() {
    return this.config.remote_document_management_url;
  }

  public getPostcodeLookupUrl() {
    return this.config.postcode_lookup_url;
  }

  public getOAuth2ClientId() {
    return this.config.oauth2_client_id;
  }

  public getPaymentsUrl() {
    return this.config.payments_url;
  }

  public getCaseHistoryUrl(jurisdictionId: string,
                           caseTypeId: string,
                           caseId: string,
                           eventId: string) {
    return this.getApiUrl()
      + `/caseworkers/:uid`
      + `/jurisdictions/${jurisdictionId}`
      + `/case-types/${caseTypeId}`
      + `/cases/${caseId}`
      + `/events/${eventId}`
      + `/case-history`;
  }

  public getCreateOrUpdateDraftsUrl(ctid: string) {
    return this.getCaseDataUrl() + `/case-types/${ctid}/drafts/`;
  }

  public getViewOrDeleteDraftsUrl(jid: string, ctid: string, did: string) {
    return this.getCaseDataUrl() + `/drafts/${did}`;
  }
}
