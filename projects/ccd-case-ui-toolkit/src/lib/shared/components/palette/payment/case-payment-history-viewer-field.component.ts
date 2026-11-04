import {
  AfterViewInit,
  Component,
  ComponentRef,
  createNgModule,
  EnvironmentInjector,
  NgModuleRef,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { PaymentField } from '../base-field/payment-field.component';

@Component({
  selector: 'ccd-case-payment-history-viewer-field',
  templateUrl: 'case-payment-history-viewer-field.html',
  styleUrls: ['./case-payment-history-viewer-field.scss'],
  standalone: false
})
export class CasePaymentHistoryViewerFieldComponent extends PaymentField implements AfterViewInit, OnDestroy {
  public readonly PAYMENT_HISTORY_WARNING = 'Recent payments may take a few minutes to reflect here.';
  public paymentLoadError = false;
  @ViewChild('paymentHost', { read: ViewContainerRef })
  private paymentHost: ViewContainerRef;
  private paymentComponentRef: ComponentRef<unknown>;
  private paymentModuleRef: NgModuleRef<unknown>;

  constructor(
    appConfig: AbstractAppConfig,
    sessionStorage: SessionStorageService,
    private readonly environmentInjector: EnvironmentInjector
  ) {
    super(appConfig, sessionStorage);
  }

  public ngAfterViewInit(): void {
    void this.renderPayment();
  }

  public ngOnDestroy(): void {
    this.paymentHost?.clear();
    this.paymentComponentRef = undefined;
    this.paymentModuleRef?.destroy();
  }

  private async renderPayment(): Promise<void> {
    let paymentLibrary;
    try {
      paymentLibrary = await import('@hmcts/ccpay-web-component');
    } catch {
      this.paymentLoadError = true;
      return;
    }

    const { PaymentLibComponent, PaymentLibModule } = paymentLibrary;
    this.paymentModuleRef = createNgModule(PaymentLibModule, this.environmentInjector);
    this.paymentComponentRef = this.paymentHost.createComponent(PaymentLibComponent, {
      ngModuleRef: this.paymentModuleRef
    });
    this.paymentComponentRef.setInput('API_ROOT', this.getBaseURL());
    this.paymentComponentRef.setInput('CCD_CASE_NUMBER', this.caseReference);
    this.paymentComponentRef.setInput('BULKSCAN_API_ROOT', this.getPayBulkScanBaseURL());
    this.paymentComponentRef.setInput('SELECTED_OPTION', 'CCDorException');
    this.paymentComponentRef.setInput('ISBSENABLE', 'true');
    this.paymentComponentRef.setInput('LOGGEDINUSEREMAIL', this.getUserEmail());
    this.paymentComponentRef.setInput('LOGGEDINUSERROLES', this.getUserRoles());
    this.paymentComponentRef.setInput('REFUNDS_API_ROOT', this.getRefundsUrl());
    this.paymentComponentRef.setInput('NOTIFICATION_API_ROOT', this.getNotificationUrl());
    this.paymentComponentRef.setInput('VIEW', 'case-transactions');
    this.paymentComponentRef.setInput('TAKEPAYMENT', false);
    this.paymentComponentRef.setInput('SERVICEREQUEST', false);
    this.paymentComponentRef.setInput('PAYMENT_GROUP_REF', null);
    this.paymentComponentRef.setInput('EXC_REFERENCE', this.caseReference);
    this.paymentComponentRef.setInput('DCN_NUMBER', null);
    this.paymentComponentRef.setInput('ISPAYMENTSTATUSENABLED', 'Enable');
  }
}
