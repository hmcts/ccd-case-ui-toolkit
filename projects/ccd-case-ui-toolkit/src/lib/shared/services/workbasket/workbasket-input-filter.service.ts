import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { WorkbasketInputModel } from '../../domain';
import { HttpService } from '../http/http.service';

@Injectable()
export class WorkbasketInputFilterService {
  public static readonly V2_MEDIATYPE_WORKBASKET_INPUT_DETAILS =
  'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-workbasket-input-details.v2+json;charset=UTF-8';

  private currentJurisdiction: string;
  private currentCaseType: string;

  constructor(private readonly httpService: HttpService, private readonly appConfig: AbstractAppConfig) {
  }

  public getWorkbasketInputUrl(caseTypeId: string): string {
    return `${this.appConfig.getCaseDataUrl()}/internal/case-types/${caseTypeId}/work-basket-inputs`;
  }

  public getWorkbasketInputs(jurisdictionId: string, caseTypeId: string): Observable<WorkbasketInputModel[]> {
    const url = this.getWorkbasketInputUrl(caseTypeId);
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', WorkbasketInputFilterService.V2_MEDIATYPE_WORKBASKET_INPUT_DETAILS)
      .set('Content-Type', 'application/json');

    this.currentJurisdiction = jurisdictionId;
    this.currentCaseType = caseTypeId;
    return this.httpService
      .get(url, {headers, observe: 'body'})
      .pipe(
        map(body => {
          const workbasketInputs = body.workbasketInputs;
          if (this.isDataValid(jurisdictionId, caseTypeId)) {
            workbasketInputs.forEach(item => {
              item.field.label = item.label;
              if (item.display_context_parameter) {
                item.field.display_context_parameter = item.display_context_parameter;
              }
            });
          } else {
            throw new Error('Response expired');
          }
          return workbasketInputs;
        })
      );
  }

  public isDataValid(jurisdictionId: string, caseTypeId: string): boolean {
    return this.currentJurisdiction === jurisdictionId && this.currentCaseType === caseTypeId;
  }
}
