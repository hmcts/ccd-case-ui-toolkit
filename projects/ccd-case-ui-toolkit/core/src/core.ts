import { CommonModule } from '@angular/common';
import { Component, Inject, Injectable, InjectionToken, Input, Optional } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

export abstract class AbstractAppConfig {
  public abstract load(): Promise<void>;
  public abstract getLoginUrl(): string;
  public abstract getApiUrl(): string;
  public abstract getCaseDataUrl(): string;
  public abstract getDocumentManagementUrl(): string;
  public abstract getDocumentManagementUrlV2(): string;
  public abstract getCdamExclusionList(): string;
  public abstract getDocumentSecureModeCaseTypeExclusions(): string;
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
  public abstract getTimeoutsForCaseRetrieval(): number[];
  public abstract getTimeoutsCaseRetrievalArtificialDelay(): number;
  public abstract getActivityBatchCollectionDelayMs(): number;
  public abstract getActivityMaxRequestPerBatch(): number;
  public abstract getCaseHistoryUrl(caseId: string, eventId: string): string;
  public abstract getPrintServiceUrl(): string;
  public abstract getIcpEnable(): boolean;
  public abstract getIcpJurisdictions(): string[];
  public abstract logMessage(logMessage: string): void;
  public abstract getEnableServiceSpecificMultiFollowups(): string[];
  public abstract getPaginationPageSize(): number;
  public abstract getBannersUrl(): string;
  public abstract getPrdUrl(): string;
  public abstract getCacheTimeOut(): number;
  public abstract getWorkAllocationApiUrl(): string;
  public abstract getRefundsUrl(): string;
  public abstract getNotificationUrl(): string;
  public abstract getPaymentReturnUrl(): string;
  public abstract getCategoriesAndDocumentsUrl(): string;
  public abstract getDocumentDataUrl(): string;
  public abstract getCaseFlagsRefdataApiUrl(): string;
  public abstract getRDCommonDataApiUrl(): string;
  public abstract getCaseDataStoreApiUrl(): string;
  public abstract getEventsToHide(): string[];

  public getRemotePrintServiceUrl(): string { return undefined; }
  public getUserInfoApiUrl(): string { return undefined; }
  public getWAServiceConfig(): any { return undefined; }
  public getAccessManagementBasicViewMock(): any { return undefined; }
  public getAccessManagementRequestReviewMockModel(): any { return undefined; }
  public getLocationRefApiUrl(): string { return undefined; }
  public getCamRoleAssignmentsApiUrl(): string { return undefined; }

  public getEnvironment(): string {
    if (this.getActivityUrl()?.includes('.aat.')) return 'aat';
    if (this.getActivityUrl()?.includes('.preview.')) return 'preview';
    if (this.getActivityUrl()?.includes('.demo.')) return 'demo';
    if (this.getActivityUrl()?.includes('.ithc.')) return 'ithc';
    return 'prod';
  }
}

export class CaseEditorConfig {
  [key: string]: any;
}

@Injectable()
export class WindowService {
  public locationAssign(url: string): void { window.location.assign(url); }
  public setLocalStorage(key: string, value: string): void { window.localStorage.setItem(key, value); }
  public getLocalStorage(key: string): string | null { return window.localStorage.getItem(key); }
  public clearLocalStorage(): void { window.localStorage.clear(); }
  public removeLocalStorage(key: string): void { window.localStorage.removeItem(key); }
  public setSessionStorage(key: string, value: string): void { window.sessionStorage.setItem(key, value); }
  public getSessionStorage(key: string): string | null { return window.sessionStorage.getItem(key); }
  public openOnNewTab(url: string): void {
    const openedWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (openedWindow) openedWindow.opener = null;
  }
  public confirm(message: string): boolean { return window.confirm(message); }
  public alert(message: string): void { window.alert(message); }
}

@Injectable()
export class FocusService {
  public readonly elementIdToFocus = 'focusService-elementIdToFocus';
  public focus(): void {
    document.getElementById(this.elementIdToFocus)?.focus();
  }
}

@Injectable({ providedIn: 'root' })
class SessionStorageService {
  public getItem(key: string): string | null { return sessionStorage.getItem(key); }
}

export type SessionJsonErrorLogger = (error: unknown) => void;
export const SessionErrorRoute = new InjectionToken<string>('SessionErrorRoute');
export const SessionJsonErrorLogger = new InjectionToken<SessionJsonErrorLogger>('SessionJsonErrorLogger');

@Injectable({ providedIn: 'root' })
export class SessionStorageGuard implements CanActivate {
  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router,
    @Optional() @Inject(SessionErrorRoute) private readonly errorRoute?: string,
    @Optional() @Inject(SessionJsonErrorLogger) private readonly errorLogger?: SessionJsonErrorLogger
  ) {}

  public canActivate(): boolean {
    const userInfo = this.sessionStorageService.getItem('userDetails');
    if (!userInfo) return true;
    try {
      JSON.parse(userInfo);
      return true;
    } catch {
      const error = new Error('Invalid userDetails in session storage');
      this.errorLogger?.(error);
      this.router.navigate([this.errorRoute || '/session-error']);
      return false;
    }
  }
}

@Component({
  selector: 'ccd-session-error-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="govuk-width-container">
      <main class="govuk-main-wrapper govuk-main-wrapper--l" id="content" role="main">
        <div class="govuk-grid-row"><div class="govuk-grid-column-two-thirds">
          <h1 class="govuk-heading-xl">{{ title }}</h1>
          <p class="govuk-body">{{ primaryMessage }}</p>
          <p class="govuk-body">{{ secondaryMessage }}</p>
        </div></div>
      </main>
    </div>
  `,
})
export class SessionErrorPageComponent {
  @Input() public title = 'There is a problem with your session';
  @Input() public primaryMessage = 'Go to landing page. Refreshing the page. If the problem persists, sign out and sign in again.';
  @Input() public secondaryMessage = 'If you still cannot access the service, clear your browser data for this website.';
}
