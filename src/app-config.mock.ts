import { AbstractAppConfig } from './app.config';
import { CaseTab } from './shared';

export class AppMockConfig implements AbstractAppConfig {
  getActivityBatchCollectionDelayMs(): number {
    return 0;
  }

  getActivityMaxRequestPerBatch(): number {
    return 0;
  }

  getActivityNexPollRequestMs(): number {
    return 0;
  }

  getActivityRetry(): number {
    return 0;
  }

  getActivityUrl(): string {
    return '';
  }

  getAnnotationApiUrl(): string {
    return '';
  }

  getApiUrl(): string {
    return '';
  }

  getBannersUrl(): string {
    return '';
  }

  getCacheTimeOut(): number {
    return 0;
  }

  getCaseDataUrl(): string {
    return '';
  }

  getCaseHistoryUrl(caseId: string, eventId: string): string {
    return '';
  }

  getCreateOrUpdateDraftsUrl(ctid: string): string {
    return '';
  }

  getDocumentManagementUrl(): string {
    return '';
  }

  getHrsUrl(): string {
    return '';
  }

  getLoginUrl(): string {
    return '';
  }

  getOAuth2ClientId(): string {
    return '';
  }

  getPaginationPageSize(): number {
    return 0;
  }

  getPayBulkScanBaseUrl(): string {
    return '';
  }

  getPaymentsUrl(): string {
    return '';
  }

  getPostcodeLookupUrl(): string {
    return '';
  }

  getPrdUrl(): string {
    return '';
  }

  getPrintServiceUrl(): string {
    return '';
  }

  getRemoteDocumentManagementUrl(): string {
    return '';
  }

  getRemoteHrsUrl(): string {
    return '';
  }

  getRemotePrintServiceUrl(): string {
    return '';
  }

  getUserInfoApiUrl(): string {
    return '';
  }

  getViewOrDeleteDraftsUrl(did: string): string {
    return '';
  }

  getWorkAllocationApiUrl(): string {
    return '';
  }

  load(): Promise<void> {
    return Promise.resolve(undefined);
  }

  prependedCaseViewTabs(): CaseTab[] {
    return [
      {
        label: 'Tasks',
        id: 'tasks',
        fields: [],
        show_condition: null
      },
      {
        label: 'Roles & access',
        id: 'roles',
        fields: [],
        show_condition: null
      }
    ];
  }

}
