import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { PaymentField } from '../base-field/payment-field.component';

@Component({
    selector: 'ccd-ways-to-pay-field',
    templateUrl: './waystopay-field.component.html'
})
export class WaysToPayFieldComponent extends PaymentField {
  constructor(
    appConfig: AbstractAppConfig,
    sessionStorage: SessionStorageService
  ) {
    super(appConfig, sessionStorage);
  }

  public getCardPaymentReturnUrl(): string {
    return this.appConfig.getPaymentReturnUrl();
  }
}
