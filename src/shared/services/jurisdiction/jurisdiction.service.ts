import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Jurisdiction, JurisdictionConfig } from '../../domain';
import { HttpService } from '../http';
import { AbstractAppConfig } from '../../../app.config';
import { Observable } from 'rxjs';
import { Headers, URLSearchParams } from '@angular/http';

@Injectable()
export class JurisdictionService {
  public static readonly V2_MEDIATYPE_JURISDICTION_CONFIGS =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-jurisdiction-configs.v2+json;charset=UTF-8';

  private selectedJurisdictionSource = new Subject<Jurisdiction>();

  selectedJurisdiction = this.selectedJurisdictionSource.asObservable();

  constructor(private httpService: HttpService, private appConfig: AbstractAppConfig) {
  }

  announceSelectedJurisdiction(jurisdiction: Jurisdiction) {
    this.selectedJurisdictionSource.next(jurisdiction);
  }

  getJurisdictionConfigs(jurisdictionReferences: string[]): Observable<JurisdictionConfig[]> {
    let url = this.appConfig.getJurisdictionUiConfigsUrl();
    let headers = new Headers({
      'experimental': 'true',
      'Accept': JurisdictionService.V2_MEDIATYPE_JURISDICTION_CONFIGS
    });
    let params: URLSearchParams = new URLSearchParams();
    jurisdictionReferences.forEach(reference => params.append('ids', reference));
    return this.httpService
      .get(url, {params, headers})
      .map(response => {
        let jsonResponse = response.json();
        let configs = jsonResponse.configs;
        return configs;
      });
  }

}
