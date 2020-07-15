import { Injectable } from '@angular/core';
import { RequestOptionsArgs } from '@angular/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { Headers } from '@angular/http';
import { RequestOptionsBuilder, SearchView } from '../request';
import { SearchInput } from '../../components/search-filters';
import { SearchResultView } from '../../domain/search';

@Injectable()
export class SearchService {
  public static readonly V2_MEDIATYPE_SEARCH_INPUTS =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-search-input-details.v2+json;charset=UTF-8';
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
      .pipe(
        map(response => {
          console.log(response.json());
          return response.json()
        })
      );
  }

  public searchCases(caseTypeIds: string[],
                metaCriteria: object, caseCriteria: object, view?: SearchView): Observable<{}> {
    const url = this.appConfig.getCaseDataUrl() + `/internal/searchCases?ctid=${caseTypeIds}`;

    let {options, body} = this.requestOptionsBuilder.buildOptionsAndBody(metaCriteria, caseCriteria, view);

    return this.httpService
      .post(url, body)
      .pipe(
        map(response => {
          return this.handleElasticSearchResponse(response.json());
        })
      );
  }

  handleElasticSearchResponse(json: {total: number, cases: {}[], headers: {fields: {}[]}[]}): {} {

    const results = json.cases.map(caseObj => {
      caseObj['case_fields'] = caseObj['fields'];
      caseObj['case_fields_formatted'] = caseObj['fields_formatted'];
      delete caseObj['fields'];
      delete caseObj['fields_formatted'];
      return caseObj;
    });

    const handledResponse = { total: json.total, results: results, columns: json.headers[0].fields }

    console.log(handledResponse);

    return handledResponse;
  }

  getSearchInputUrl(caseTypeId: string): string {
    return `${this.appConfig.getCaseDataUrl()}/internal/case-types/${caseTypeId}/search-inputs`;
  }

  getSearchInputs(jurisdictionId: string, caseTypeId: string): Observable<SearchInput[]> {
    let url = this.getSearchInputUrl(caseTypeId);
    const headers = new Headers({
      'Accept': SearchService.V2_MEDIATYPE_SEARCH_INPUTS,
      'experimental': 'true',
    });
    this.currentJurisdiction = jurisdictionId;
    this.currentCaseType = caseTypeId;
    return this.httpService
      .get(url, { headers })
      .pipe(
        map(response => {
          let jsonResponse = response.json();
          let searchInputs = jsonResponse.searchInputs;
          if (this.isDataValid(jurisdictionId, caseTypeId)) {
            searchInputs.forEach(item => {
              item.field.label = item.label;
            });
          } else {
            throw new Error('Response expired');
          }
          return searchInputs;
        })
      );
  }

  isDataValid(jurisdictionId: string, caseTypeId: string): boolean {
    return this.currentJurisdiction === jurisdictionId && this.currentCaseType === caseTypeId
  }
}
