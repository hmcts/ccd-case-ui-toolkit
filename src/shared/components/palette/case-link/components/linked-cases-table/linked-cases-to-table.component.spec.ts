import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import {
  async,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesToTableComponent } from './linked-cases-to-table.component';

import createSpyObj = jasmine.createSpyObj;
import { CaseField } from '../../../../../domain';
import {
  CommonDataService,
} from '../../../../../services/common-data-service/common-data-service';
import { AbstractAppConfig } from '../../../../../../app.config';
import { LinkedCasesService } from '../../services';
import { mockCaseLinkingReasonCode, mockCaseLinkResponse, mocklinkedCases, mockSearchByCaseIdsResponse } from '../__mocks__';

describe('LinkCasesToTableComponent', () => {
  let component: LinkedCasesToTableComponent;
  let fixture: ComponentFixture<LinkedCasesToTableComponent>;
  let casesService: any;
  let searchService: any;
  let commonDataService: any;
  let appConfig: any;
  let linkedCasesService: any;

  linkedCasesService = {
    caseId: '1682374819203471',
    linkedCases: mocklinkedCases,
  };

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: '',
  };

  beforeEach(async(() => {
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
    component.caseField = <CaseField>{
      id: 'caseLink',
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
    };
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

  it('should find atleast one casename missing a tag in the table', () => {
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
    fixture.detectChanges();
    expect(component.linkedCasesFromResponse.length).toEqual(2);
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
    component.linkedCasesFromResponse = [];
    component.ngOnInit();
    fixture.detectChanges();
    expect(
      document.getElementsByClassName('govuk-table__cell')[0].textContent.trim()
    ).toEqual('None');
  });
});
