import { AbstractAppConfig } from '../../../../app.config';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { AbstractFieldReadComponent } from './abstract-field-read.component';
import { CurrentUserService } from '../../../services/session/current-user.service';

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

    public getNotificationUrl() {
        return this.appConfig.getNotificationUrl();
    }

    public getUserRoles() {
        const userDetails = CurrentUserService.readUserInfo(this.sessionStorage);
        if (!userDetails || !userDetails.hasOwnProperty('roles')) {
            return [];
        }
        return userDetails.roles;
    }

    public getUserEmail() {
        const userDetails = CurrentUserService.readUserInfo(this.sessionStorage);
        return userDetails?.email || '';
    }
}
