import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer, of } from 'rxjs';
import { publishReplay, refCount, take, map } from 'rxjs/operators';
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

export interface OrganisationVm {
    organisationIdentifier: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    townCity: string;
    county: string;
    country: string;
    postCode: string;
}

@Injectable()
export class OrganisationService {
    private organisations$: Observable<OrganisationVm[]>;

    public static mapOrganisation(organisations: Organisation[]): OrganisationVm [] {
        const organisationsVm = new Array<OrganisationVm>();
        organisations.forEach(org => {
            let contactInformation = null;
            if (org.contactInformation &&  org.contactInformation[0]) {
                contactInformation = org.contactInformation[0];
            }
            organisationsVm.push({
                organisationIdentifier: org.organisationIdentifier,
                name: org.name,
                addressLine1: contactInformation !== null ? contactInformation.addressLine1 : null,
                addressLine2: contactInformation !== null ? contactInformation.addressLine2 : null,
                addressLine3: contactInformation !== null ? contactInformation.addressLine3 : null,
                townCity: contactInformation !== null ? contactInformation.townCity : null,
                county: contactInformation !== null ? contactInformation.county : null,
                country: contactInformation !== null ? contactInformation.country : null,
                postCode: contactInformation !== null ? contactInformation.postCode : null,
            });
        });
        return organisationsVm;
      }

    constructor(private readonly http: HttpClient,
                private readonly appconfig: AbstractAppConfig) {}

    public getActiveOrganisations(): Observable<OrganisationVm[]> {
        if (!this.organisations$) {
            const url = this.appconfig.getPrdUrl();
            const cacheTimeOut = this.appconfig.getCacheTimeOut();
            this.organisations$ = this.http.get<Organisation[]>(url)
            .pipe(map((orgs) => OrganisationService.mapOrganisation(orgs)),
            publishReplay(1), refCount(), take(1)).catch(e => {
                console.log(e);
                // Handle error and return blank Observable array
                return of([]);
            });
            timer(cacheTimeOut).subscribe(() => {
                this.organisations$ = null;
            });
        }
        return this.organisations$;
    }
}
