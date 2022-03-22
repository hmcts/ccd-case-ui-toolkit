export interface AccessManagementBasicViewMockModel {
  active?: boolean;
  basicFields?: {
    caseNameHmctsInternal?: string,
      caseManagementLocation?: {
        baseLocation?: number
      }
  };
  accessProcess?: string;
}

export interface AccessManagementRequestReviewMockModel {
  active?: boolean;
  details?: {
    caseName: string;
    caseReference: string;
    dateSubmitted: string;
    requestFrom: string;
    reasonForCaseAccess: string;
  };
  accessProcess?: string;
}

export abstract class AbstractAppConfig {
  abstract load(): Promise<void>;
  abstract getLoginUrl(): string;
  abstract getApiUrl(): string;
  abstract getCaseDataUrl(): string;
  abstract getDocumentManagementUrl(): string;
  getDocumentManagementUrlV2(): string {
    return undefined;
  }
  getDocumentSecureMode(): boolean {
    return undefined;
  }
  abstract getRemoteDocumentManagementUrl(): string;
  abstract getHrsUrl(): string;
  abstract getRemoteHrsUrl(): string;
  abstract getAnnotationApiUrl(): string;
  abstract getPostcodeLookupUrl(): string;
  abstract getOAuth2ClientId(): string;
  abstract getPaymentsUrl(): string;
  abstract getPayBulkScanBaseUrl(): string;
  abstract getCreateOrUpdateDraftsUrl(ctid: string): string
  abstract getViewOrDeleteDraftsUrl(did: string): string
  abstract getActivityUrl(): string;
  abstract getActivityNexPollRequestMs(): number;
  abstract getActivityRetry(): number;
  abstract getActivityBatchCollectionDelayMs(): number;
  abstract getActivityMaxRequestPerBatch(): number;
  abstract getCaseHistoryUrl(caseId: string, eventId: string): string;
  abstract getPrintServiceUrl(): string;
  /**
   * Dummy version replacing deprecated `getRemotePrintServiceUrl()`, to be removed in next major release
   * @deprecated
   * @returns `undefined`
   */
  getRemotePrintServiceUrl(): string {
    return undefined;
  }
  abstract getPaginationPageSize(): number;
  abstract getBannersUrl(): string;
  abstract getPrdUrl(): string;
  abstract getCacheTimeOut(): number;
  abstract getWorkAllocationApiUrl(): string;
  getUserInfoApiUrl(): string {
    return undefined;
  }
  getAccessManagementMode(): boolean {
    return undefined;
  }
  getAccessManagementBasicViewMock(): AccessManagementBasicViewMockModel {
    return undefined;
  }
  getAccessManagementRequestReviewMockModel(): AccessManagementRequestReviewMockModel {
    return undefined;
  }
  getLocationRefApiUrl(): string {
    return undefined;
  }
  getCamRoleAssignmentsApiUrl(): string {
    return undefined;
  }
  abstract getRefundsUrl(): string;
  abstract getPaymentReturnUrl(): string;
}

export class CaseEditorConfig {
  api_url: string;
  case_data_url: string;
  document_management_url: string;
  document_management_url_v2: string;
  hrs_url: string;
  document_management_secure_enabled: boolean;
  login_url: string;
  oauth2_client_id: string;
  postcode_lookup_url: string;
  remote_document_management_url: string;
  remote_hrs_url: string;
  annotation_api_url: string;
  payments_url: string;
  pay_bulk_scan_url: string;
  activity_batch_collection_delay_ms: number;
  activity_next_poll_request_ms: number;
  activity_retry: number;
  activity_url: string;
  activity_max_request_per_batch: number;
  print_service_url: string;
  /**
   * remote_print_service_url marked as optional since deprecation, ahead of removal in next major release
   * @deprecated
   */
  remote_print_service_url?: string;
  pagination_page_size: number;
  prd_url: string;
  cache_time_out: number;
  work_allocation_api_url: string;
  user_info_api_url: string;
  access_management_mode?: boolean;
  access_management_basic_view_mock?: {
    active?: boolean,
    basicFields?: {
      caseNameHmctsInternal?: string,
      caseManagementLocation?: {
        baseLocation?: number
      }
    },
    accessProcess?: string
  };
  access_management_request_review_mock?: {
  active?: boolean;
  details?: {
    caseName: string;
    caseReference: string;
    dateSubmitted: string;
    requestFrom: string;
    reasonForCaseAccess: string;
  };
  accessProcess?: string;
  }
  location_ref_api_url?: string;
  cam_role_assignments_api_url?: string;
  refunds_url: string;
  payment_return_url: string;
}
