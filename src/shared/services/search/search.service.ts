import { Injectable } from '@angular/core';
import { RequestOptionsArgs } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { RequestOptionsBuilder, SearchView } from '../request';
import { SearchInput } from '../../components/search-filters';
import { SearchResultView } from '../../domain/search';

@Injectable()
export class SearchService {

  public static readonly VIEW_SEARCH = 'SEARCH';
  public static readonly VIEW_WORKBASKET = 'WORKBASKET';
  public static readonly FIELD_PREFIX = 'case.';
  private currentJurisdiction: string;
  private currentCaseType: string;

  constructor(private appConfig: AbstractAppConfig,
              private httpService: HttpService,
              private requestOptionsBuilder: RequestOptionsBuilder) { }

  public search(jurisdictionId: string, caseTypeId: string,
                metaCriteria: object, caseCriteria: object, view?: SearchView): Observable<SearchResultView> {
    const url = this.appConfig.getApiUrl() + `/caseworkers/:uid`
                                           + `/jurisdictions/${jurisdictionId}`
                                           + `/case-types/${caseTypeId}`
                                           + `/cases`;

    let options: RequestOptionsArgs = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, view);

    return this.httpService
      .get(url, options)
      .map(response => response.json());
  }

  getSearchInputUrl(jurisdictionId: string, caseTypeId: string): string {
    return `${this.appConfig.getApiUrl()}/caseworkers/:uid/jurisdictions/${jurisdictionId}/case-types/${caseTypeId}/inputs`;
  }

  getSearchInputs(jurisdictionId: string, caseTypeId: string): Observable<SearchInput[]> {
    let url = this.getSearchInputUrl(jurisdictionId, caseTypeId);
    this.currentJurisdiction = jurisdictionId;
    this.currentCaseType = caseTypeId;
    return this.httpService
      .get(url)
      .map(response => {
        let searchInputs = response.json();
        if (this.isDataValid(jurisdictionId, caseTypeId)) {
          searchInputs.forEach(item => {
            item.field.label = item.label;
          });
        } else {
          throw new Error('Response expired');
        }
        return searchInputs;
      });
  }

  isDataValid(jurisdictionId: string, caseTypeId: string): boolean {
    return this.currentJurisdiction === jurisdictionId && this.currentCaseType === caseTypeId
  }
}
