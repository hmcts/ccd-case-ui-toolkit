import { CaseField } from '../domain/definition/case-field.model';
import { CaseEventTrigger } from '../domain/case-view/case-event-trigger.model';
import { CaseEventData } from '../domain';
import { AbstractAppConfig } from '../../app.config';

export let createCaseEventTrigger = (id: string,
                                      name: string,
                                      case_id: string,
                                      show_summary: boolean,
                                      case_fields: CaseField[],
                                      wizard_pages = [],
                                      can_save_draft = false) => {
  const eventTrigger = new CaseEventTrigger();

  eventTrigger.id = id;
  eventTrigger.name = name;
  eventTrigger.case_id = case_id;
  eventTrigger.show_summary = show_summary;
  eventTrigger.wizard_pages = wizard_pages;
  eventTrigger.event_token = 'test-token';
  eventTrigger.case_fields = case_fields;
  eventTrigger.can_save_draft = can_save_draft;
  return eventTrigger;
};

export class Config {
  activity_batch_collection_delay_ms: number;
  activity_max_request_per_batch: number;
  activity_next_poll_request_ms: number;
  activity_retry: number;
  activity_url: string;
  api_url: string;
  case_data_url: string;
  document_management_url: string;
  login_url: string;
  logout_url: string;
  oauth2_client_id: string;
  oauth2_token_endpoint_url: string;
  pagination_page_size: number;
  postcode_lookup_url: string;
  print_service_url: string;
  remote_document_management_url: string;
  remote_print_service_url: string;
  smart_survey_url: string;
  payments_url: string;
  unsupported_browser_url: string;
  chrome_min_required_version: number;
  ie_min_required_version: number;
  edge_min_required_version: number;
  firefox_min_required_version: number;
}

export class AppConfig extends AbstractAppConfig {
  config: Config;

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public getLoginUrl(): string {
    return this.config.login_url;
  }

  public getLogoutUrl(): string {
    return this.config.logout_url;
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

  public getPaginationPageSize() {
    return this.config.pagination_page_size;
  }

  public getPostcodeLookupUrl() {
    return this.config.postcode_lookup_url;
  }

  public getOAuth2TokenEndpointUrl() {
    return this.config.oauth2_token_endpoint_url;
  }

  public getOAuth2ClientId() {
    return this.config.oauth2_client_id;
  }

  public getPrintServiceUrl() {
    return this.config.print_service_url;
  }

  public getRemotePrintServiceUrl() {
    return this.config.remote_print_service_url;
  }

  public getSmartSurveyUrl() {
    return this.config.smart_survey_url;
  }

  public getUnsupportedBrowserUrl() {
    return this.config.unsupported_browser_url;
  }

  public getActivityUrl() {
    return this.config.activity_url;
  }

  public getActivityNexPollRequestMs() {
    return this.config.activity_next_poll_request_ms;
  }

  public getActivityRetry() {
    return this.config.activity_retry;
  }

  public getActivityBatchCollectionDelayMs() {
    return this.config.activity_batch_collection_delay_ms;
  }

  public getActivityMaxRequestPerBatch() {
    return this.config.activity_max_request_per_batch;
  }

  public getPaymentsUrl() {
    return this.config.payments_url;
  }

  public getChromeMinRequiredVersion() {
    return this.config.chrome_min_required_version;
  }

  public getIEMinRequiredVersion() {
    return this.config.ie_min_required_version;
  }

  public getEdgeMinRequiredVersion() {
    return this.config.edge_min_required_version;
  }

  public getFirefoxMinRequiredVersion() {
    return this.config.firefox_min_required_version;
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

  public getDraftsUrl(jid: string, ctid: string, eventData: CaseEventData) {
    return this.getCaseDataUrl() + `/caseworkers/:uid/jurisdictions/${jid}/case-types/${ctid}/event-trigger/${eventData.event.id}/drafts/`;
  }
}
