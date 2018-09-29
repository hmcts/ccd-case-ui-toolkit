import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';
import { AppConfig } from '../../app.config';

@Component({
  selector: 'ccd-case-payment-history-viewer-field',
  templateUrl: 'case-payment-history-viewer-field.html',
})
export class CasePaymentHistoryViewerFieldComponent extends AbstractFieldReadComponent {

  constructor(
    private appConfig: AppConfig
  ) {
    super();
  }

  getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

}
