import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { environment } from './environments/environment';
import { CaseEventData } from './domain/case-event-data';

@Injectable()
export class AppConfig {

  protected config: Config;

  constructor(private http: Http) {}

  public load(): Promise<void> {
    console.log('Loading app config...');

    let configUrl = environment.configUrl;

    return new Promise<void>((resolve, reject) => {
      this.http
        .get(configUrl)
        .map(response => response.json())
        .catch((error: any): any => {
          console.error(`Configuration ${configUrl} could not be read`, error);
          reject();
          return Observable.throw(error.json().error || 'Server error');
        })
        .subscribe((config: Config) => {
          this.config = config;
          console.log('Loading app config: OK');
          resolve();
        });
    });
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
