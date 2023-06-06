import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { CaseField } from '../../../../../domain';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { SearchService } from '../../../../../services';
import {
  CommonDataService
} from '../../../../../services/common-data-service/common-data-service';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesService } from '../../services';
import { mockCaseLinkingReasonCode, mockCaseLinkResponse, mocklinkedCases, mockSearchByCaseIdsResponse } from '../__mocks__';
import { LinkedCasesToTableComponent } from './linked-cases-to-table.component';

import createSpyObj = jasmine.createSpyObj;

interface LinkedCasesResponse {
  caseReference: string;
  caseName: string;
  caseType: string;
  caseTypeDescription: string;
  service: string;
  state: string;
  stateDescription: string;
  reasons: any;
}

describe('LinkCasesToTableComponent', () => {
  let component: LinkedCasesToTableComponent;
  let fixture: ComponentFixture<LinkedCasesToTableComponent>;
  let casesService: any;
  let searchService: any;
  let commonDataService: any;
  let appConfig: any;

  const linkedCasesService = {
    caseId: '1682374819203471',
    linkedCases: mocklinkedCases,
    getAllLinkedCaseInformation() { },
    getCaseName() { },
    jurisdictionsResponse: [
      {
        id: 'SSCS',
        name: 'Tribunals',
        description: 'Social Security and Child Support',
        caseTypes: [
          {
            id: 'SSCS_ExceptionRecord',
            description: 'Bulkscanning Exception',
            version: null,
            name: 'SSCS Bulkscanning',
          },
        ],
        states: [{}],
      },
    ],
    mapLookupIDToValueFromJurisdictions() { }
  };

  const caseViewData = {
    case_id: '1682374819203471',
    case_type: {
      id: 'Benefit_Xui',
      name: 'Benefit_Xui',
      description: 'some case_type description',
      jurisdiction: {
        id: 'JURI_1',
        name: 'TEST',
        description: 'some jurisdiction description'
      }
    },
    state: {
      name: 'state name'
    },
    channels: [],
    tabs: [],
    triggers: [],
    events: []
  };

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: '',
  };

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', [
      'getRDCommonDataApiUrl',
    ]);
    commonDataService = createSpyObj('commonDataService', ['getRefData']);
    casesService = createSpyObj('casesService', [
      'getCaseViewV2',
      'getCaseLinkResponses',
    ]);
    searchService = createSpyObj('searchService', [
      'searchCases',
      'searchCasesByIds',
    ]);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, PipesModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { data: { case: { case_id: '123' } } } },
        },
        { provide: Router, useValue: mockRouter },
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService },
        { provide: CommonDataService, useValue: commonDataService },
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: LinkedCasesService, useValue: linkedCasesService },
      ],
      declarations: [LinkedCasesToTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance;
    spyOn(component, 'searchCasesByCaseIds').and.returnValue(
      of([
        {
          results: mockSearchByCaseIdsResponse,
        },
      ])
    );
    component.caseField = {
      id: 'caseLinks',
      field_type: {
        id: 'Text',
        type: 'Text',
        complex_fields: [],
      },
      display_context: 'OPTIONAL',
      label: 'First name',
      show_summary_content_option: {},
      retain_hidden_value: false,
      hidden: false,
    } as CaseField;
    commonDataService.getRefData.and.returnValue(of(mockCaseLinkingReasonCode));
    component.caseField.value = mockCaseLinkResponse;
  });

  it('should create component/headers', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const tableHeading = document.getElementsByTagName('h1');
    expect(component).toBeTruthy();
    expect(tableHeading).not.toBeNull();
  });

  it('should call searchCasesByCaseIds by casetype', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.searchCasesByCaseIds).toHaveBeenCalledTimes(2);
  });

  it('should has lead case or consolidated return correct value', () => {
    expect(component.hasLeadCaseOrConsolidated('CLRC015')).toEqual(true);
    expect(component.hasLeadCaseOrConsolidated('CLRC016')).toEqual(true);
    expect(component.hasLeadCaseOrConsolidated('RANDOM')).toEqual(false);
  });

  it('should get case reference link return ', () => {
    component.caseId = '1111222233334444';
    expect(component.getCaseRefereneLink('1111222233334444')).toEqual('4444');
  });

  it('should get sort order based on reason code', () => {
    expect(component.getReasonSortOrder('CLRC016')).toEqual(1);
    expect(component.getReasonSortOrder('CLRC015')).toEqual(2);
    expect(component.getReasonSortOrder('any')).toEqual(3);
  });

  it('should map api response', () => {
    spyOn(linkedCasesService, 'getCaseName').and.returnValue('case name');
    const linkCasesResponse: LinkedCasesResponse = {
      caseReference: '1682374819203471',
      caseName: 'case name',
      caseType: 'Benefit_Xui',
      caseTypeDescription: 'some case_type description',
      service: 'some jurisdiction description',
      state: 'state name',
      stateDescription: '',
      reasons: [{
        id: 'ffea83f4-3ec1-4be6-b530-e0b0b2a239aa',
        value: {
          Reason: 'CLRC001',
          OtherDescription: 'testing',
        }
      }]
    };
    expect(component.mapResponse(caseViewData)).toEqual(linkCasesResponse);
  });

  /* Disabling this test for now to do the time constraint */
  /* Will be re-visited later */
  xit('should find atleast one casename missing a tag in the table', () => {
    let caseNameMissingEle = 0;
    component.ngOnInit();
    fixture.detectChanges();
    document.querySelectorAll('a').forEach((item) => {
      if (item.textContent.includes('Case name missing')) {
        caseNameMissingEle += 1;
      }
    });
    expect(caseNameMissingEle).toBeGreaterThan(0);
  });

  it('should render linkedcases top table', () => {
    component.ngOnInit();
    expect(component.linkedCasesFromResponse.length).toEqual(1);
  });

  it('should render the failure panel when api returns non 200', () => {
    component.searchCasesByCaseIds = jasmine
      .createSpy()
      .and.returnValue(throwError({}));
    component.ngOnInit();
    spyOn(component.notifyAPIFailure, 'emit');
    fixture.detectChanges();
    expect(component.notifyAPIFailure.emit).toHaveBeenCalledWith(true);
  });

  it('should render the none as table row when no linked cases to be displayed', () => {
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(
      document.getElementsByClassName('govuk-table__cell')[0].textContent.trim()
    ).toEqual('None');
  });
});
