import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractAppConfig, CaseEditorConfig } from '@hmcts/ccd-case-ui-toolkit';

@Injectable()
export class AppConfig extends AbstractAppConfig {

  protected config: CaseEditorConfig = {
    'api_url': '/aggregated',
    'case_data_url': '/data',
    'document_management_url': '/documents',
    'hrs_url': '/hearing-recordings',
    'login_url': '/login',
    'oauth2_client_id': 'ccd_gateway',
    'postcode_lookup_url': '/api/addresses?postcode=${postcode}',
    'remote_document_management_url': '/documents',
    'remote_hrs_url': '/hearing-recordings',
    'annotation_api_url': '/em-anno',
    'payments_url': '/payments',
    'pay_bulk_scan_url': '/pay-bulkscan',
    'activity_batch_collection_delay_ms': 1,
    'activity_next_poll_request_ms': 5000,
    'activity_retry': 5,
    'activity_url': '',
    'activity_max_request_per_batch': 25,
    'print_service_url': '/print',
    'pagination_page_size': 25,
    'prd_url': 'api/caseshare/orgs',
    'cache_time_out': 45000,
    'work_allocation_api_url': '/workallocation',
    'user_info_api_url': '/user-info',
    'document_management_url_v2': '/v2/health',
    'document_management_secure_enabled': true,
    'access_management_mode': true,
    'refunds_url': '/api/refunds',
    'payment_return_url': 'https://paymentoutcome-web.demo.platform.hmcts.net/',
    'case_flags_refdata_api_url': '/refdata/commondata/caseflags/service-id=:sid',
    'events_to_hide': [
      'queryManagementRespondQuery'
    ]
  };

  constructor(private http: HttpClient) {
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

  public getHrsUrl() {
    return this.config.hrs_url;
  }

  public getRemoteHrsUrl() {
    return this.config.remote_hrs_url;
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

  public getTimeoutsForCaseRetrieval() {
    return this.config.timeouts_case_retrieval;
  }

  public getTimeoutsCaseRetrievalArtificialDelay() {
    return this.config.timeouts_case_retrieval_artificial_delay;
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

  public getPaginationPageSize() {
    return this.config.pagination_page_size;
  }

  public getBannersUrl() {
    return this.getCaseDataUrl() + `/internal/banners/`;
  }

  public getPrdUrl(): string {
    return this.config.prd_url;
  }

  public getCacheTimeOut(): number {
    return this.config.cache_time_out;
  }

  public getWorkAllocationApiUrl(): string {
    return this.config.work_allocation_api_url;
  }

  public getUserInfoApiUrl(): string {
    return this.config.user_info_api_url;
  }

  public getRemotePrintServiceUrl(): string {
    return this.config.print_service_url;
  }

  public getAccessManagementMode(): boolean {
    return this.config.access_management_mode;
  }

  public getWAServiceConfig(): any {
    return this.config.wa_service_config;
  }

  public getRefundsUrl(): string {
    return this.config.refunds_url;
  }

  public getPaymentReturnUrl(): string {
    return this.config.payment_return_url;
  }

  public getCaseFlagsRefdataApiUrl(): string {
    return this.config.case_flags_refdata_api_url;
  }

  public getEventsToHide(): string[] {
    return this.config.events_to_hide;
  }
}
