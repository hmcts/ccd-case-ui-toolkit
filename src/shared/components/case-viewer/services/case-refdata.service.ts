import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '../../..';
import { AbstractAppConfig } from '../../../..';

@Injectable()
export class CaseRefdataService {
    
    constructor(
        private http: HttpService,
        private appConfig: AbstractAppConfig
    ) {}

    public getCourtOrHearingCentreName(locationId: number): Observable<any> {
        return this.http.get(`${this.appConfig.getPrdUrl()}/refdata/location/court-venue/services?service_code=${locationId}`)
    }

}
