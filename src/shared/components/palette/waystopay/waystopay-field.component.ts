import { Component } from '@angular/core';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { AbstractAppConfig } from '../../../../app.config';
import { AbstractFieldWriteComponent } from '../base-field';

@Component({
    selector: 'ccd-ways-to-pay-field',
    templateUrl: './waystopay-field.component.html'
})
export class WaysToPayFieldComponent extends AbstractFieldWriteComponent {
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
        const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails') || null);
        if (!userDetails || !userDetails.hasOwnProperty('roles')) {
          return [];
        }
        return userDetails.roles;
      }

      public getUserEmail() {
        const userDetails = JSON.parse(this.sessionStorage.getItem('userDetails') || null);
        if (!userDetails || !userDetails.hasOwnProperty('sub')) {
          return '';
        }
        return userDetails.sub;
      }
}
