import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { async, ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PipesModule } from '../../../../../pipes/pipes.module';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkCaseReason } from '../../domain';
import { LinkedCasesToTableComponent } from './linked-cases-to-table.component';

import createSpyObj = jasmine.createSpyObj;
import { CaseField } from '../../../../../domain';
import { CommonDataService } from '../../../../../services/common-data-service/common-data-service';

describe('LinkCasesToTableComponent', () => {
  let component: LinkedCasesToTableComponent;
  let fixture: ComponentFixture<LinkedCasesToTableComponent>;
  let casesService: any;
  let searchService: any;
  let commonDataService: any;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };

  let mockCaseLinkResponse = [
    {
      'caseReference': '1652112127295261',
      'modified_date_time': '2022-05-10',
      'caseType': 'Benefit_SCSS',
      'reasons': [
        {
          'reasonCode': 'Same Party',
          'OtherDescription': ''
        }
      ]
    },
    {
      'caseReference': '1652111610080172',
      'modified_date_time': '2022-05-10',
      'caseType': 'Benefit_SCSS',
      'reasons': [
        {
          'reasonCode': 'Case consolidated',
          'OtherDescription': ''
        }
      ]
    },
    {
      'caseReference': '1652111179220086',
      'modified_date_time': '2022-05-10',
      'caseType': 'Benefit_SCSS',
      'reasons': [
        {
          'reasonCode': 'Progressed as part of this lead case',
          'OtherDescription': ''
        },
        {
          'reasonCode': 'Familial',
          'OtherDescription': ''
        }
      ]
    }
  ];
  const linkCaseReasons: LinkCaseReason[] = [
    {
      key: 'progressed',
      value_en: 'Progressed as part of this lead case',
      value_cy: '',
      hint_text_en: 'Progressed as part of this lead case',
      hint_text_cy: '',
      lov_order: 1,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
      selected: true,
    },
    {
      key: 'bail',
      value_en: 'Bail',
      value_cy: '',
      hint_text_en: 'Bail',
      hint_text_cy: '',
      lov_order: 2,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
    {
      key: 'other',
      value_en: 'Other',
      value_cy: '',
      hint_text_en: 'Other',
      hint_text_cy: '',
      lov_order: 3,
      parent_key: null,
      category_key: 'caseLinkReason',
      parent_category: '',
      active_flag: 'Y',
      child_nodes: null,
      from: 'exui-default',
    },
  ];
  beforeEach(async(() => {
    commonDataService = createSpyObj('commonDataService', ['getRefData']);
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    searchService = createSpyObj('searchService', ['searchCases', 'searchCasesByIds']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PipesModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {snapshot: {data: {case: {case_id: '123'}}}}
        },
        { provide: Router, useValue: mockRouter },
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService },
        { provide: CommonDataService, useValue: commonDataService }
      ],
      declarations: [LinkedCasesToTableComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance
    spyOn(component, 'searchCasesByCaseIds').and.returnValue(of([{results: [{
      'case_id': '1652111179220086',
      'supplementary_data': {
          'HMCTSServiceId': 'BBA3'
      },
      'case_fields': {
          '[JURISDICTION]': 'SSCS',
          'dwpDueDate': '2022-06-13',
          '[LAST_STATE_MODIFIED_DATE]': '2022-05-09T15:46:31.153',
          'caseReference': '22',
          '[CREATED_DATE]': '2022-05-09T15:46:19.243',
          'dateSentToDwp': '2022-05-09',
          '[CASE_REFERENCE]': '1652111179220086',
          '[STATE]': 'withDwp',
          '[ACCESS_GRANTED]': 'STANDARD',
          '[SECURITY_CLASSIFICATION]': 'PUBLIC',
          '[ACCESS_PROCESS]': 'NONE',
          '[CASE_TYPE]': 'Benefit_SCSS',
          'appeal.appellant.name.lastName': 'Torres',
          'region': 'Quo nostrum vitae re',
          '[LAST_MODIFIED_DATE]': '2022-05-09T15:46:31.153'
      }
  }] }]));
    component.caseField = <CaseField>({
      id: 'caseLink',
      field_type: {
      id: 'Text',
      type: 'Text',
      complex_fields: []
      },
      display_context: 'OPTIONAL',
      label: 'First name',
      show_summary_content_option: {},
      retain_hidden_value:  false,
      hidden: false,
      });
    commonDataService.getRefData.and.returnValue(of(linkCaseReasons));
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

  it('should render linkedcases top table', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.linkedCasesFromResponse.length).toEqual(2);
  });

  it('should render the failure panel when api returns non 200', () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '?error'
    };
    mockRouter.url = '?error';
    const injector = getTestBed();
    const router = injector.get(Router);
    router.url = '=?error';
    TestBed.overrideProvider(Router, {useValue: mockRouter})
    TestBed.compileComponents();
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    spyOn(component.notifyAPIFailure, 'emit');
    fixture.detectChanges();
    expect(component.notifyAPIFailure.emit).toHaveBeenCalledWith(true);
  });

  it('should render the none as table row when no linked cases to be displayed', () => {
    const injector = getTestBed();
    const router = injector.get(Router);
    router.url = '?no-linked-cases';
    TestBed.overrideProvider(Router, {useValue: mockRouter})
    TestBed.compileComponents();
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
    expect(document.getElementsByClassName('govuk-table__cell')[0].textContent.trim()).toEqual('None');
  });
});
