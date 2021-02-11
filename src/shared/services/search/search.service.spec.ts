import { SearchService } from './search.service';
import createSpyObj = jasmine.createSpyObj;
import { of, Observable } from 'rxjs';
import { SearchInput } from '../../components/search-filters';
import { FieldType, Field } from '../../domain';
import { RequestOptionsBuilder } from '../request';
import { HttpService, OptionsType } from '../http';
import { AbstractAppConfig } from '../../../app.config';
import { HttpHeaders, HttpParams } from '@angular/common/http';

describe('SearchService', () => {

  const JID = 'TEST';
  const CTID = 'TestAddressBookCase';
  const API_URL = 'http://aggregated.ccd.reform';
  const DATA_URL = 'http://data.ccd.reform';
  const SEARCH_URL = API_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases`;
  const VIEW = `WORKBASKET`;
  const SEARCH_CASES_URL = DATA_URL + `/internal/searchCases?ctid=${CTID}&use_case=${VIEW}`;
  const SEARCH_INPUT_URL = DATA_URL + '/internal/case-types/0/search-inputs';

  const SEARCH_VIEW = {
    columns: [],
    results: [],
    hasDrafts: () => false
  };

  const TEST_FIELD_TYPE_NAME = 'Text';
  const TEST_FIELD_TYPE: FieldType = {
    id: TEST_FIELD_TYPE_NAME,
    type: TEST_FIELD_TYPE_NAME
  };
  const TEST_CASE_TYPE_ID = '0';
  const TEST_JURISTICTION_ID = '0';
  const SEARCH_INPUT_LABEL = 'test-label';
  const SEARCH_INPUT_ORDER = 10;
  const TEST_FIELD_ID = 'PersonFirstName';
  const TEST_FIELD: Field = new Field(TEST_FIELD_ID, TEST_FIELD_TYPE);
  const SEARCH_INPUT: SearchInput = new SearchInput(SEARCH_INPUT_LABEL, SEARCH_INPUT_ORDER, TEST_FIELD);
  const SEARCH_INPUTS = { searchInputs: [SEARCH_INPUT]};

  let params: HttpParams;
  let appConfig: any;
  let httpService: any;
  let searchService: SearchService;
  let requestOptionsArgs: OptionsType;
  let requestOptionsBuilder: any;

  describe('get()', () => {

    beforeEach(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(DATA_URL);

      httpService = createSpyObj<HttpService>('httpService', ['get']);
      httpService.get.and.returnValue(Observable.of({}));

      params = new HttpParams();
      requestOptionsArgs = { params, observe: 'body' };

      requestOptionsBuilder = createSpyObj<RequestOptionsBuilder>('requestOptionsBuilder', ['buildOptions']);
      requestOptionsBuilder.buildOptions.and.returnValue(requestOptionsArgs);

      searchService = new SearchService(appConfig, httpService, requestOptionsBuilder);
    });

    it('should call httpService with right URL, authorization, meta and case criteria and http method for search', () => {
      searchService
        .search(JID, CTID, {}, {})
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params, observe: 'body'});
    });

    it('should call requestOptionsBuilder with right meta, case criteria and no view arguments', () => {
      let metaCriteria = { 'caseState': 'testState'};
      let caseCriteria = { 'firstName': 'testFirstName', 'lastName': 'testLastName'};

      searchService
        .search(JID, CTID, metaCriteria, caseCriteria)
        .subscribe();

      expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria);
    });

    it('should set `view` param if required', () => {
      searchService
        .search(JID, CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe();

      params.set('view', SearchService.VIEW_WORKBASKET);
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params, observe: 'body'});
    });

    it('should call requestOptionsBuilder with right meta, case criteria and view arguments', () => {
      let metaCriteria = { 'caseState': 'testState'};
      let caseCriteria = { 'firstName': 'testFirstName', 'lastName': 'testLastName'};
      searchService
        .search(JID, CTID, metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET)
        .subscribe();

      expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET);
    });

    // FIXME
    xit('should set criteria params if passed', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should set criteria params with case field data when passed', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {'name': 'value'})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      params.set('case.name', 'value');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should set criteria params with case field data when passed with spaces stripped', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {'name': ' value '})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      params.set('case.name', 'value');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should not set criteria params with case field data when passed as empty', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {'name': ''})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should not set criteria params with case field data when passed with spaces', () => {
      const metadata = {
        jurisdiction: 'TEST',
        case_type: 'CT_TEST'
      };
      searchService
        .search(JID, CTID, metadata, {'name': '   '})
        .subscribe();

      params.set('jurisdiction', 'TEST');
      params.set('case_type', 'CT_TEST');
      expect(httpService.get).toHaveBeenCalledWith(SEARCH_URL, {params});
    });

    // FIXME
    xit('should return search results', () => {
      searchService
        .search(JID, CTID, {}, {})
        .subscribe(resultView => {
          expect(resultView).toEqual(SEARCH_VIEW);
        });
    });

    it('should call backend with right URL, authorization and method for search input', () => {
      httpService.get.and.returnValue(of(SEARCH_INPUTS))

      searchService
        .getSearchInputs(TEST_JURISTICTION_ID, TEST_CASE_TYPE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(SEARCH_INPUT_URL, {       
        headers: new HttpHeaders()
          .set('experimental', 'true')
          .set('Accept', SearchService.V2_MEDIATYPE_SEARCH_INPUTS)
          .set('Content-Type', 'application/json'),
        observe: 'body'
      });
    });

    it('should return search input results', () => {
      httpService.get.and.returnValue(of(SEARCH_INPUTS));

      searchService
        .getSearchInputs(TEST_JURISTICTION_ID, TEST_CASE_TYPE_ID)
        .subscribe(resultInputModel => {
          expect(resultInputModel[0].field.id).toEqual(SEARCH_INPUTS.searchInputs[0].field.id);
        });
    });

  });

  describe('post()', () => {

    beforeEach(() => {
      function matchCall(value: any, expected: any): boolean {
        return expected === value ||
            JSON.stringify(expected) === JSON.stringify(value) ||
            expected[0] === value[0] && JSON.stringify(expected[1]).trim() === JSON.stringify(value[1]).trim();
      }

      jasmine.addCustomEqualityTester(matchCall);

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getPaginationPageSize']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(DATA_URL);
      appConfig.getPaginationPageSize.and.returnValue(25);

      httpService = createSpyObj<HttpService>('httpService', ['post']);
      httpService.post.and.returnValue(Observable.of({}));

      params = new HttpParams();
      requestOptionsArgs = { params, observe: 'body' };

      requestOptionsBuilder = createSpyObj<RequestOptionsBuilder>('requestOptionsBuilder', ['buildOptions']);
      requestOptionsBuilder.buildOptions.and.returnValue(requestOptionsArgs);

      searchService = new SearchService(appConfig, httpService, requestOptionsBuilder);
    });

    it('should call httpService with right URL, authorization, meta and case criteria and http method for search', () => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe();

      expect(httpService.post).toHaveBeenCalledWith(SEARCH_CASES_URL, { sort: undefined, size: 25 }, {params, observe: 'body'});
    });

    it('should call requestOptionsBuilder with right meta, case criteria and no view arguments', () => {
      let metaCriteria = { 'caseState': 'testState'};
      let caseCriteria = { 'firstName': 'testFirstName', 'lastName': 'testLastName'};

      searchService
        .searchCases(CTID, metaCriteria, caseCriteria)
        .subscribe();

      expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria);
    });

    it('should set `view` param if required', () => {
      searchService
        .searchCases(CTID, {}, {}, SearchService.VIEW_WORKBASKET)
        .subscribe();

      params.set('view', SearchService.VIEW_WORKBASKET);
      expect(httpService.post).toHaveBeenCalledWith(SEARCH_CASES_URL, { sort: undefined, size: 25 }, {params, observe: 'body'});
    });

    it('should call requestOptionsBuilder with right meta, case criteria and view arguments', () => {
      let metaCriteria = { 'caseState': 'testState'};
      let caseCriteria = { 'firstName': 'testFirstName', 'lastName': 'testLastName'};
      searchService
        .searchCases(CTID, metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET)
        .subscribe();

      expect(requestOptionsBuilder.buildOptions).toHaveBeenCalledWith(metaCriteria, caseCriteria, SearchService.VIEW_WORKBASKET);
    });

  });
});
