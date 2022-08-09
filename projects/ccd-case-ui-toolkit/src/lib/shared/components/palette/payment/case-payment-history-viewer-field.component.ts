import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { PaymentField } from '../base-field/payment-field.component';

@Component({
  selector: 'ccd-case-payment-history-viewer-field',
  templateUrl: 'case-payment-history-viewer-field.html',
})
export class CasePaymentHistoryViewerFieldComponent extends PaymentField {
  constructor(
    appConfig: AbstractAppConfig,
    sessionStorage: SessionStorageService
  ) {
    super(appConfig, sessionStorage);
  }
}
