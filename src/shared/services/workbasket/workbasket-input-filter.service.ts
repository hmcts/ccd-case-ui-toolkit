import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import { Headers } from '@angular/http';
import { HttpService, WorkbasketInputModel } from '../..';
import { AbstractAppConfig } from '../../..';

@Injectable()
export class WorkbasketInputFilterService {
  public static readonly V2_MEDIATYPE_WORKBASKET_INPUT_DETAILS =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-workbasket-input-details.v2+json;charset=UTF-8';

  private currentJurisdiction: string;
  private currentCaseType: string;

  constructor(private httpService: HttpService, private appConfig: AbstractAppConfig) {
  }

  getWorkbasketInputUrl(caseTypeId: string): string {
    return `${this.appConfig.getCaseDataUrl()}/internal/case-types/${caseTypeId}/work-basket-inputs`;
  }

  getWorkbasketInputs(jurisdictionId: string, caseTypeId: string): Observable<WorkbasketInputModel[]> {
    let url = this.getWorkbasketInputUrl(caseTypeId);
    let headers = new Headers({
      'experimental': 'true',
      'Accept': WorkbasketInputFilterService.V2_MEDIATYPE_WORKBASKET_INPUT_DETAILS
    });
    this.currentJurisdiction = jurisdictionId;
    this.currentCaseType = caseTypeId;
    return this.httpService
      .get(url, {headers})
      .map(response => {
        let jsonResponse = response.json();
        let workbasketInputs = jsonResponse.workbasketInputs;
        if (this.isDataValid(jurisdictionId, caseTypeId)) {
          workbasketInputs.forEach(item => {
            item.field.label = item.label;
          });
        } else {
          throw new Error('Response expired');
        }
        return workbasketInputs;
      });
  }

  isDataValid(jurisdictionId: string, caseTypeId: string): boolean {
    return this.currentJurisdiction === jurisdictionId && this.currentCaseType === caseTypeId
  }
}
