import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';

@Component({
  selector: 'ccd-case-payment-history-viewer-field',
  templateUrl: 'case-payment-history-viewer-field.html',
})
export class CasePaymentHistoryViewerFieldComponent extends AbstractFieldReadComponent {

  constructor(
    private appConfig: AbstractAppConfig,
    private readonly sessionStorage: SessionStorageService
  ) {
    super();
  }

  getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

  getPayBulkScanBaseURL() {
    return this.appConfig.getPayBulkScanBaseUrl();
  }

  public getUserRoles() {
    const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails'));
    if (!userDetails || !userDetails.hasOwnProperty('roles')) {
      return [];
    }
    return userDetails.roles;
  }

}
