import { CaseEventData } from './shared/domain/case-event-data.model';

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
  abstract getCreateOrUpdateDraftsUrl(jid: string, ctid: string, eventData: CaseEventData): string
  abstract getViewOrDeleteDraftsUrl(jid: string, ctid: string, did: string): string
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
}
