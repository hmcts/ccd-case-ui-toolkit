import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { AbstractAppConfig, CaseEditorConfig } from '@hmcts/ccd-case-ui-toolkit';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class AppConfig extends AbstractAppConfig {

  protected config: Config;

  constructor(private httpClient: HttpClient) {
    super();
  }

  public load(): Promise<void> {
    console.log('Loading app config...');

    let configUrl = environment.configUrl;

    return new Promise<void>((resolve, reject) => {
      this.httpClient
        .get(configUrl)
        .catch((error: any): any => {
          console.error(`Configuration ${configUrl} could not be read`, error);
          reject();
          return throwError(error.json().error || 'Server error');
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

  public getAnnotationApiUrl() {
    return this.config.annotation_api_url;
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

  public getPayBulkScanBaseUrl() {
    return this.config.pay_bulk_scan_url;
  }

  public getCaseHistoryUrl(caseId: string, eventId: string) {
    return this.getCaseDataUrl()
      + `/internal`
      + `/cases/${caseId}`
      + `/events/${eventId}`;
  }

  public getCreateOrUpdateDraftsUrl(ctid: string) {
    return this.getCaseDataUrl() + `/case-types/${ctid}/drafts/`;
  }

  public getViewOrDeleteDraftsUrl(did: string) {
    return this.getCaseDataUrl() + `/drafts/${did}`;
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

  public getPrintServiceUrl() {
    return this.config.print_service_url;
  }

  public getRemotePrintServiceUrl() {
    return this.config.remote_print_service_url;
  }

  public getPaginationPageSize() {
    return this.config.pagination_page_size;
  }

  public getBannersUrl() {
    return this.getCaseDataUrl() + `/internal/banners/`;
  }

  public getJurisdictionUiConfigsUrl() {
    return this.getCaseDataUrl() + `/internal/jurisdiction-ui-configs/`;
  }

  public getLoggingLevel() {
    return this.config.logging_level;
  }

  public getLoggingCaseFieldList() {
    return this.config.logging_case_field_list;
  }
}

export class Config extends CaseEditorConfig {
  api_url: string;
  case_data_url: string;
  document_management_url: string;
  login_url: string;
  oauth2_client_id: string;
  postcode_lookup_url: string;
  remote_document_management_url: string;
  annotation_api_url: string;
  payments_url: string;
  pay_bulk_scan_url: string;
  activity_batch_collection_delay_ms: number;
  activity_next_poll_request_ms: number;
  activity_retry: number;
  activity_url: string;
  activity_max_request_per_batch: number;
  print_service_url: string;
  remote_print_service_url: string;
  pagination_page_size: number;
  logging_level: string;
  logging_case_field_list: string;
}
