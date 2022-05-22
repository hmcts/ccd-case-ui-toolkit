import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SearchService } from '../../../../../services';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkCaseReason, LinkedCase } from '../../domain';
import { LinkedCaseProposalEnum } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { LinkedCasesToTableComponent } from './linked-cases-to-table.component';
import createSpyObj = jasmine.createSpyObj;

describe('LinkCasesComponent', () => {
  let component: LinkedCasesToTableComponent;
  let fixture: ComponentFixture<LinkedCasesToTableComponent>;
  let nextButton: any;
  let casesService: any;
  let searchService: any;
  let caseLinkedResults: any = [
    {
      results: [{
        case_id: '16934389402343',
        '[CASE_TYPE]': 'SSCS',
        '[CREATED_DATE]': '12-12-2022',
        '[STATE]': 'state',
        '[JURISDICTION]': 'Tribunal'
      }]
    }
  ];

  const selectedCasesInfo: LinkedCase[] = [{
    caseLink: {
      caseReference: '1682374819203471',
      linkReason: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    }
  }];
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
    casesService = createSpyObj('casesService', ['getCaseViewV2', 'getCaseLinkResponses']);
    searchService = createSpyObj('searchService', ['searchCases']);
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        LinkedCasesService,
        { provide: CasesService, useValue: casesService },
        { provide: SearchService, useValue: searchService }
      ],
      declarations: [LinkedCasesToTableComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    const caseInfo = {
      case_id: '1682374819203471',
      case_type: {
        name: 'SSCS type',
        jurisdiction: { name: '' }
      }, state: { name: 'With FTA' }
    }
    fixture = TestBed.createComponent(LinkedCasesToTableComponent);
    component = fixture.componentInstance;
    casesService.getCaseLinkResponses.and.returnValue(of(linkCaseReasons));
    spyOn(component, 'getAllLinkedCaseInformation').and.returnValue([caseInfo]);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should check getCaseLinkResponses error', () => {
    casesService.getCaseLinkResponses.and.returnValue(throwError({}));
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.linkCaseReasons).toEqual([]);
  });
});
