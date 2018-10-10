import { CaseEventData } from './shared/domain/case-event-data';

export abstract class AbstractAppConfig {

  config: Config;

  abstract load(): Promise<void>;
  abstract getLoginUrl(): string;
  abstract getLogoutUrl(): string;
  abstract getApiUrl(): string;
  abstract getCaseDataUrl(): string;
  abstract getDocumentManagementUrl(): string;
  abstract getRemoteDocumentManagementUrl(): string;
  abstract getPaginationPageSize(): number;
  abstract getPostcodeLookupUrl(): string;
  abstract getOAuth2TokenEndpointUrl(): string;
  abstract getOAuth2ClientId(): string;
  abstract getPrintServiceUrl(): string;
  abstract getRemotePrintServiceUrl(): string;
  abstract getSmartSurveyUrl(): string;
  abstract getUnsupportedBrowserUrl(): string;
  abstract getActivityUrl(): string;
  abstract getActivityNexPollRequestMs(): number;
  abstract getActivityRetry(): number;
  abstract getActivityBatchCollectionDelayMs(): number;
  abstract getActivityMaxRequestPerBatch(): number;
  abstract getPaymentsUrl(): string;
  abstract getChromeMinRequiredVersion(): number;
  abstract getIEMinRequiredVersion(): number;
  abstract getEdgeMinRequiredVersion(): number;
  abstract getFirefoxMinRequiredVersion(): number;
  abstract getCaseHistoryUrl(jurisdictionId: string, caseTypeId: string, caseId: string, eventId: string): string;
  abstract getCreateOrUpdateDraftsUrl(jid: string, ctid: string, eventData: CaseEventData): string
  abstract getViewOrDeleteDraftsUrl(jid: string, ctid: string, did: string): string
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
