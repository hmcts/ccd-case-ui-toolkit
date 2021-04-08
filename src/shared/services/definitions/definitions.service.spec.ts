import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { Observable } from 'rxjs';
import { DefinitionsService } from './definitions.service';
import createSpyObj = jasmine.createSpyObj;
import { HttpService } from '../http/http.service';
import { CaseTypeLite, Jurisdiction } from '../../domain';

describe('DefinitionsService', () => {

  const API_DATA_URL = 'http://data.ccd.reform/aggregated';
  const JID = 'PROBATE';
  const CTID = 'TestAddressBookCase';
  const CTID_2 = 'TestAddressBookCase2';
  const CASE_TYPES_URL = API_DATA_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types?access=create`;

  let appConfig: any;
  let httpService: any;

  let definitionsService: DefinitionsService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getApiUrl']);
    appConfig.getApiUrl.and.returnValue(API_DATA_URL);

    httpService = createSpyObj<HttpService>('httpService', ['get']);

    definitionsService = new DefinitionsService(httpService, appConfig);
  });

  describe('getCaseTypes()', () => {
    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of([createCaseType(CTID), createCaseType(CTID_2)]));
    });

    it('should use HttpService::get with correct url', () => {
      definitionsService
        .getCaseTypes(JID, 'create')
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(CASE_TYPES_URL);
    });

    it('should retrieve case type from server', () => {
      definitionsService
        .getCaseTypes(JID, 'create')
        .subscribe(
          caseTypesData => expect(caseTypesData).toEqual([createCaseType(CTID), createCaseType(CTID_2)])
        );
    });
  });

  describe('getJurisdictions()', () => {
    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of([createJurisdiction('jId1'), createJurisdiction('jId2')]));
    });

    it('should retrieve jurisdiction from server', () => {
      definitionsService
        .getJurisdictions('create')
        .subscribe(
          jurisdictionData => expect(jurisdictionData).toEqual([createJurisdiction('jId1'), createJurisdiction('jId2')])
        );
    });
  });

  function createCaseType(caseTypeId: string): CaseTypeLite {
    return {
      id: caseTypeId,
      name: 'Complex Address Book Case',
      events: [],
      states: [],
      description: 'Complex Address Book Case'
    };
  }

  function createJurisdiction(jurisdictionId: string): Jurisdiction {
    return {
      id: jurisdictionId,
      name: 'Probate',
      description: 'Content for the Probate Jurisdiction.',
      caseTypes: [createCaseType('ct1'), createCaseType('ct2'), createCaseType('ct3')]
    };
  }
});
