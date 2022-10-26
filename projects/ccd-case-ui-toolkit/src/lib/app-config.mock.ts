import {
  AbstractAppConfig,
  AccessManagementBasicViewMockModel,
  AccessManagementRequestReviewMockModel
} from './app.config';

export class AppMockConfig implements AbstractAppConfig {
  public getActivityBatchCollectionDelayMs(): number {
    return 0;
  }

  public getActivityMaxRequestPerBatch(): number {
    return 0;
  }

  public getActivityNexPollRequestMs(): number {
    return 0;
  }

  public getActivityRetry(): number {
    return 0;
  }

  public getActivityUrl(): string {
    return '';
  }

  public getAnnotationApiUrl(): string {
    return '';
  }

  public getApiUrl(): string {
    return '';
  }

  public getBannersUrl(): string {
    return '';
  }

  public getCacheTimeOut(): number {
    return 0;
  }

  public getCaseDataUrl(): string {
    return '';
  }

  public getCaseHistoryUrl(caseId: string, eventId: string): string {
    return '';
  }

  public getCreateOrUpdateDraftsUrl(ctid: string): string {
    return '';
  }

  public getDocumentManagementUrl(): string {
    return '';
  }

  public getHrsUrl(): string {
    return '';
  }

  public getLoginUrl(): string {
    return '';
  }

  public getOAuth2ClientId(): string {
    return '';
  }

  public getPaginationPageSize(): number {
    return 0;
  }

  public getPayBulkScanBaseUrl(): string {
    return '';
  }

  public getPaymentsUrl(): string {
    return '';
  }

  public getPostcodeLookupUrl(): string {
    return '';
  }

  public getPrdUrl(): string {
    return '';
  }

  public getPrintServiceUrl(): string {
    return '';
  }

  public getRemoteDocumentManagementUrl(): string {
    return '';
  }

  public getRemoteHrsUrl(): string {
    return '';
  }

  public getRemotePrintServiceUrl(): string {
    return '';
  }

  public getUserInfoApiUrl(): string {
    return '';
  }

  public getViewOrDeleteDraftsUrl(did: string): string {
    return '';
  }

  public getWorkAllocationApiUrl(): string {
    return '';
  }

  public load(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public getDocumentManagementUrlV2(): string {
    return '';
  }

  public getDocumentSecureMode(): boolean {
    return false;
  }

  public getAccessManagementMode(): boolean {
    return false;
  }

  public getAccessManagementBasicViewMock(): AccessManagementBasicViewMockModel {
    return {};
  }

  public getAccessManagementRequestReviewMockModel(): AccessManagementRequestReviewMockModel {
    return {};
  }

  public getLocationRefApiUrl(): string {
    return '';
  }

  public getCamRoleAssignmentsApiUrl(): string {
    return '';
  }

  public getRefundsUrl(): string {
    return '';
  }

  public getPaymentReturnUrl(): string {
    return '';
  }

  public getCategoriesAndDocumentsUrl(): string {
    return '';
  }

  public getDocumentDataUrl(): string {
    return '';
  }
}
