// tslint:disable:variable-name
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
  public abstract load(): Promise<void>;
  public abstract getLoginUrl(): string;
  public abstract getApiUrl(): string;
  public abstract getCaseDataUrl(): string;
  public abstract getDocumentManagementUrl(): string;
  public getDocumentManagementUrlV2(): string {
    return undefined;
  }
  public getDocumentSecureMode(): boolean {
    return undefined;
  }
  public abstract getRemoteDocumentManagementUrl(): string;
  public abstract getHrsUrl(): string;
  public abstract getRemoteHrsUrl(): string;
  public abstract getAnnotationApiUrl(): string;
  public abstract getPostcodeLookupUrl(): string;
  public abstract getOAuth2ClientId(): string;
  public abstract getPaymentsUrl(): string;
  public abstract getPayBulkScanBaseUrl(): string;
  public abstract getCreateOrUpdateDraftsUrl(ctid: string): string;
  public abstract getViewOrDeleteDraftsUrl(did: string): string;
  public abstract getActivityUrl(): string;
  public abstract getActivityNexPollRequestMs(): number;
  public abstract getActivityRetry(): number;
  public abstract getActivityBatchCollectionDelayMs(): number;
  public abstract getActivityMaxRequestPerBatch(): number;
  public abstract getCaseHistoryUrl(caseId: string, eventId: string): string;
  public abstract getPrintServiceUrl(): string;
  /**
   * Dummy version replacing deprecated `getRemotePrintServiceUrl()`, to be removed in next major release
   * @deprecated
   * @returns `undefined`
   */
  public getRemotePrintServiceUrl(): string {
    return undefined;
  }
  public abstract getPaginationPageSize(): number;
  public abstract getBannersUrl(): string;
  public abstract getPrdUrl(): string;
  public abstract getCacheTimeOut(): number;
  public abstract getWorkAllocationApiUrl(): string;
  public getUserInfoApiUrl(): string {
    return undefined;
  }
  public getWAServiceConfig(): any {
    return undefined;
  }
  public getAccessManagementMode(): boolean {
    return undefined;
  }
  public getAccessManagementBasicViewMock(): AccessManagementBasicViewMockModel {
    return undefined;
  }
  public getAccessManagementRequestReviewMockModel(): AccessManagementRequestReviewMockModel {
    return undefined;
  }
  public getLocationRefApiUrl(): string {
    return undefined;
  }
  public abstract getRefundsUrl(): string;
  public abstract getNotificationUrl(): string;
  public abstract getPaymentReturnUrl(): string;
  public abstract getCategoriesAndDocumentsUrl(): string;
  public abstract getDocumentDataUrl(): string;
  public getCamRoleAssignmentsApiUrl(): string {
    return undefined;
  }
  public abstract getCaseFlagsRefdataApiUrl(): string;
  public abstract getRDCommonDataApiUrl(): string;
  public abstract getCaseDataStoreApiUrl(): string;
}

export class CaseEditorConfig {
  public api_url: string;
  public case_data_url: string;
  public document_management_url: string;
  public document_management_url_v2: string;
  public hrs_url: string;
  public document_management_secure_enabled: boolean;
  public login_url: string;
  public oauth2_client_id: string;
  public postcode_lookup_url: string;
  public remote_document_management_url: string;
  public remote_hrs_url: string;
  public annotation_api_url: string;
  public payments_url: string;
  public pay_bulk_scan_url: string;
  public activity_batch_collection_delay_ms: number;
  public activity_next_poll_request_ms: number;
  public activity_retry: number;
  public activity_url: string;
  public activity_max_request_per_batch: number;
  public print_service_url: string;
  /**
   * remote_print_service_url marked as optional since deprecation, ahead of removal in next major release
   * @deprecated
   */
  public remote_print_service_url?: string;
  public pagination_page_size: number;
  public prd_url: string;
  public cache_time_out: number;
  public work_allocation_api_url: string;
  public user_info_api_url: string;
  public wa_service_config?: any;
  public access_management_mode?: boolean;
  public access_management_basic_view_mock?: {
    active?: boolean,
    basicFields?: {
      caseNameHmctsInternal?: string,
      caseManagementLocation?: {
        baseLocation?: number
      }
    },
    accessProcess?: string
  };
  public access_management_request_review_mock?: {
    active?: boolean;
    details?: {
      caseName: string;
      caseReference: string;
      dateSubmitted: string;
      requestFrom: string;
      reasonForCaseAccess: string;
    };
    accessProcess?: string;
  };
  public location_ref_api_url?: string;
  public cam_role_assignments_api_url?: string;
  public refunds_url: string;
  public notification_url: string;
  public payment_return_url: string;
  public categories_and_documents_url: string;
  public document_data_url: string;
  public case_flags_refdata_api_url: string;
  public rd_common_data_api_url: string;
  public case_data_store_api_url: string;
}
