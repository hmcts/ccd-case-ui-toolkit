import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Jurisdiction } from '../../../../domain';
import { JurisdictionService, SearchService } from '../../../../services';
import { CASE_VIEW_DATA, mockSearchByCaseIdsResponse } from '../components/__mocks__';
import { LinkedCasesService } from './linked-cases.service';
import createSpyObj = jasmine.createSpyObj;

describe('LinkedCasesService', () => {
  const CASE_TYPES_2 = [
    {
        id: 'Benefit_Xui',
        name: 'Benefit_Xui',
        description: '',
        states: [],
        events: [],
    }];
  const MOCK_JURISDICTION: Jurisdiction[] = [{
    id: 'JURI_1',
    name: 'Jurisdiction 1',
    description: '',
    caseTypes: CASE_TYPES_2
  }];

  const searchService = createSpyObj<SearchService>('SearchService', ['searchCases', 'searchCasesByIds', 'search']);
  searchService.searchCasesByIds.and.returnValue(of({}));
  const jurisdictionService = createSpyObj<JurisdictionService>('JurisdictionService', ['getJurisdictions']);
  jurisdictionService.getJurisdictions.and.returnValue(of(MOCK_JURISDICTION));
  const linkedCasesService = new LinkedCasesService(jurisdictionService, searchService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      {provide: LinkedCasesService, useValue: linkedCasesService},
      JurisdictionService
    ]
  }));

  it('should be mapped the linked cases', () => {
    linkedCasesService.caseDetails = CASE_VIEW_DATA;
    linkedCasesService.caseFieldValue = [{
      id: '1682374819203471',
      value: {
        CaseType: 'Benefit_Xui',
        CaseReference: '1682374819203471',
        ReasonForLink: [
          {
            id: '417eeb92-4b98-475a-8536-6e844719f09a',
            value: {
              Reason: 'CLRC007'
            }
          }
        ],
        CreatedDateTime: '2022-07-20T18:48:37.079Z'
      }
    }];

    spyOn(linkedCasesService, 'searchCasesByCaseIds').and.returnValue(
      of([
        {
          results: mockSearchByCaseIdsResponse,
        },
      ])
    );

    linkedCasesService.getAllLinkedCaseInformation();
    expect(linkedCasesService.jurisdictionsResponse).not.toBeNull();
    expect(linkedCasesService.linkedCases).not.toBeNull();
  });

  it('should return case name', () => {
    expect(linkedCasesService.getCaseName(CASE_VIEW_DATA)).toEqual('Test Case C100');
  });

  it('should return case name as case name missing', () => {
    const caseViewData = CASE_VIEW_DATA;
    caseViewData.tabs = [];
    expect(linkedCasesService.getCaseName(CASE_VIEW_DATA)).toEqual('Case name missing');
  });

  it('should reset linked case data', () => {
    linkedCasesService.caseFieldValue = [1, 2, 3];
    linkedCasesService.linkedCases = [{
      caseReference: '',
      reasons: [],
      createdDateTime: '',
      caseType: '',
      caseTypeDescription: '',
      caseState: '',
      caseStateDescription: '',
      caseService: '',
      caseName: ''
    }];
    linkedCasesService.storedCaseNumber = '12345';
    linkedCasesService.cameFromFinalStep = true;
    linkedCasesService.hasNavigatedInJourney = true;

    linkedCasesService.resetLinkedCaseData();

    expect(linkedCasesService.caseFieldValue).toEqual([]);
    expect(linkedCasesService.linkedCases).toEqual([]);
    expect(linkedCasesService.storedCaseNumber).toBe('');
    expect(linkedCasesService.cameFromFinalStep).toBe(false);
    expect(linkedCasesService.hasNavigatedInJourney).toBe(false);
  });
});
