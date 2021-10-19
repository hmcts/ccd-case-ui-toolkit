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

  public getBaseURL() {
    return this.appConfig.getPaymentsUrl();
  }

  public getPayBulkScanBaseURL() {
    return this.appConfig.getPayBulkScanBaseUrl();
  }

  public getRefundsUrl() {
    return this.appConfig.getRefundsUrl();
  }

  public getUserRoles() {
    const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails'));
    if (!userDetails || !userDetails.hasOwnProperty('roles')) {
      return [];
    }
    return userDetails.roles;
  }

  public getUserEmail() {
    const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails'));
    if (!userDetails || !userDetails.hasOwnProperty('sub')) {
      return '';
    }
    return userDetails.sub;
  }

}
