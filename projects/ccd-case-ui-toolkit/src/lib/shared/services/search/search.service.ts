import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { SearchInput } from '../../components/search-filters';
import { SearchResultView } from '../../domain/search/search-result-view.model';
import { HttpService, OptionsType } from '../http/http.service';
import { LoadingService } from '../loading/loading.service';
import { RequestOptionsBuilder, SearchView } from '../request/request.options.builder';

@Injectable()
export class SearchService {
  public static readonly V2_MEDIATYPE_SEARCH_INPUTS =
    'application/vnd.uk.gov.hmcts.ccd-data-store-api.ui-search-input-details.v2+json;charset=UTF-8';
  public static readonly VIEW_SEARCH = 'SEARCH';
  public static readonly VIEW_WORKBASKET = 'WORKBASKET';
  public static readonly FIELD_PREFIX = 'case.';
  private currentJurisdiction: string;
  private currentCaseType: string;

  constructor(private readonly appConfig: AbstractAppConfig,
              private readonly httpService: HttpService,
              private readonly requestOptionsBuilder: RequestOptionsBuilder,
              private readonly loadingService: LoadingService) { }

  public search(jurisdictionId: string, caseTypeId: string,
                metaCriteria: object, caseCriteria: object, view?: SearchView): Observable<SearchResultView> {
    const url = this.appConfig.getApiUrl() + `/caseworkers/:uid`
                                           + `/jurisdictions/${jurisdictionId}`
                                           + `/case-types/${caseTypeId}`
                                           + `/cases`;

    const options: OptionsType  = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, view);
    const loadingToken = this.loadingService.register();
    return this.httpService
      .get(url, options)
      .pipe(
        map(response => response),
        finalize(() => this.loadingService.unregister(loadingToken))
      );
  }

  public searchCases(caseTypeId: string,
                metaCriteria: object, caseCriteria: object, view?: SearchView, sort?: {column: string, order: number}): Observable<{}> {
    const url = this.appConfig.getCaseDataUrl() + `/internal/searchCases?ctid=${caseTypeId}&use_case=${view}`;

    const options: OptionsType = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, view);
    const body: {} = {
      sort,
      size: this.appConfig.getPaginationPageSize()
    };
    const loadingToken = this.loadingService.register();
    return this.httpService
      .post(url, body, options)
      .pipe(
        map(response => response),
        finalize(() => this.loadingService.unregister(loadingToken))
      );
  }

  public getSearchInputUrl(caseTypeId: string): string {
    return `${this.appConfig.getCaseDataUrl()}/internal/case-types/${caseTypeId}/search-inputs`;
  }

  public getSearchInputs(jurisdictionId: string, caseTypeId: string): Observable<SearchInput[]> {
    const url = this.getSearchInputUrl(caseTypeId);
    const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', SearchService.V2_MEDIATYPE_SEARCH_INPUTS)
      .set('Content-Type', 'application/json');
    this.currentJurisdiction = jurisdictionId;
    this.currentCaseType = caseTypeId;
    return this.httpService
      .get(url, { headers, observe: 'body' })
      .pipe(
        map(body => {
          const searchInputs = body.searchInputs;
          if (this.isDataValid(jurisdictionId, caseTypeId)) {
            searchInputs.forEach(item => {
              item.field.label = item.label;
              item.field.display_context_parameter = item.display_context_parameter;
            });
          } else {
            throw new Error('Response expired');
          }
          return searchInputs;
        })
      );
  }

  public isDataValid(jurisdictionId: string, caseTypeId: string): boolean {
    return this.currentJurisdiction === jurisdictionId && this.currentCaseType === caseTypeId;
  }
}
