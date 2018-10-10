import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../app.config';

@Component({
  selector: 'ccd-case-payment-history-viewer-field',
  templateUrl: 'case-payment-history-viewer-field.html',
})
export class CasePaymentHistoryViewerFieldComponent extends AbstractFieldReadComponent {

  constructor(
    private appConfig: AbstractAppConfig
  ) {
    super();
  }

  getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

}
