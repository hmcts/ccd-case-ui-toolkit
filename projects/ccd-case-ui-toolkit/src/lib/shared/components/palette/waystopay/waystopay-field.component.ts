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
  selector: 'ccd-ways-to-pay-field',
  templateUrl: './waystopay-field.component.html',
  standalone: false
})
export class WaysToPayFieldComponent extends PaymentField implements AfterViewInit, OnDestroy {
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
    if (this.getUserRoles().length > 0) {
      void this.renderPayment();
    }
  }

  public ngOnDestroy(): void {
    this.paymentHost?.clear();
    this.paymentComponentRef = undefined;
    this.paymentModuleRef?.destroy();
  }

  public getCardPaymentReturnUrl(): string {
    return this.appConfig.getPaymentReturnUrl();
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
    this.paymentComponentRef.setInput('BULKSCAN_API_ROOT', this.getPayBulkScanBaseURL());
    this.paymentComponentRef.setInput('REFUNDS_API_ROOT', this.getRefundsUrl());
    this.paymentComponentRef.setInput('NOTIFICATION_API_ROOT', this.getNotificationUrl());
    this.paymentComponentRef.setInput('CCD_CASE_NUMBER', this.caseReference);
    this.paymentComponentRef.setInput('VIEW', 'case-transactions');
    this.paymentComponentRef.setInput('TAKEPAYMENT', false);
    this.paymentComponentRef.setInput('SERVICEREQUEST', true);
    this.paymentComponentRef.setInput('PAYMENT_GROUP_REF', null);
    this.paymentComponentRef.setInput('EXC_REFERENCE', this.caseReference);
    this.paymentComponentRef.setInput('DCN_NUMBER', null);
    this.paymentComponentRef.setInput('SELECTED_OPTION', 'CCDorException');
    this.paymentComponentRef.setInput('LOGGEDINUSERROLES', this.getUserRoles());
    this.paymentComponentRef.setInput('CARDPAYMENTRETURNURL', this.getCardPaymentReturnUrl());
    this.paymentComponentRef.setInput('ISPAYMENTSTATUSENABLED', 'Enable');
  }
}
