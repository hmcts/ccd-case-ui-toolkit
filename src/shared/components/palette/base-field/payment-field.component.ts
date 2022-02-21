import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { AbstractFieldReadComponent } from './abstract-field-read.component';

export abstract class PaymentField extends AbstractFieldReadComponent {
    constructor(
        protected readonly appConfig: AbstractAppConfig,
        protected readonly sessionStorage: SessionStorageService
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
