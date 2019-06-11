export abstract class AbstractAppConfig {
  abstract load(): Promise<void>;
  abstract getLoginUrl(): string;
  abstract getApiUrl(): string;
  abstract getCaseDataUrl(): string;
  abstract getDocumentManagementUrl(): string;
  abstract getRemoteDocumentManagementUrl(): string;
  abstract getPostcodeLookupUrl(): string;
  abstract getOAuth2ClientId(): string;
  abstract getPaymentsUrl(): string;
  abstract getCreateOrUpdateDraftsUrl(ctid: string): string
  abstract getViewOrDeleteDraftsUrl(did: string): string
  abstract getActivityUrl(): string;
  abstract getActivityNexPollRequestMs(): number;
  abstract getActivityRetry(): number;
  abstract getActivityBatchCollectionDelayMs(): number;
  abstract getActivityMaxRequestPerBatch(): number;
  abstract getCaseHistoryUrl(caseId: string, eventId: string): string;
  abstract getPrintServiceUrl(): string;
  abstract getRemotePrintServiceUrl(): string;
  abstract getPaginationPageSize(): number;
}

export class CaseEditorConfig {
  api_url: string;
  case_data_url: string;
  document_management_url: string;
  login_url: string;
  oauth2_client_id: string;
  postcode_lookup_url: string;
  remote_document_management_url: string;
  payments_url: string;
  activity_batch_collection_delay_ms: number;
  activity_next_poll_request_ms: number;
  activity_retry: number;
  activity_url: string;
  activity_max_request_per_batch: number;
  print_service_url: string;
  remote_print_service_url: string;
  pagination_page_size: number;
}
