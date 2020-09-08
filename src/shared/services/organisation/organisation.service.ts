import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { publishReplay, refCount, take } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';

export interface OrganisationSuperUser {
    firstName: string;
    lastName: string;
    email: string;
}

export interface OrganisationAddress {
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    townCity: string;
    county: string;
    country: string;
    postCode: string;
    dxAddress: any [];
}

export interface Organisation {
    organisationIdentifier: string;
    name: string;
    status: string;
    sraId: string;
    sraRegulated: boolean;
    companyNumber: string;
    companyUrl: string;
    superUser: OrganisationSuperUser;
    paymentAccount: string [];
    contactInformation: OrganisationAddress [];
}

@Injectable()
export class OrganisationService {
    private organisations$: Observable<Organisation[]>;

    constructor(private readonly http: HttpClient,
                private readonly appconfig: AbstractAppConfig) {}
    public getActiveOrganisations(): Observable<Organisation[]> {
        if (!this.organisations$) {
            const url = this.appconfig.getPrdUrl();
            const cacheTimeOut = this.appconfig.getCacheTimeOut();
            this.organisations$ = this.http.get<Organisation[]>(url).pipe(publishReplay(1), refCount(), take(1));
            timer(cacheTimeOut).subscribe(() => {
                console.log('subscribe');
                this.organisations$ = null;
            });
        }
        return this.organisations$;
    }
}
