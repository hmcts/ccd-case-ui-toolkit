import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import createSpyObj = jasmine.createSpyObj;
import { ReadLinkedCasesComponent } from './read-linked-cases.component';
import { AbstractAppConfig } from '../../../../../app.config';
import { CommonDataService, LovRefDataByServiceModel } from '../../../../services/common-data-service/common-data-service';
import { CaseLink } from '../domain';
import { LinkedCasesService } from '../services';
import { of } from 'rxjs';

describe('ReadLinkedCases', () => {
  let component: ReadLinkedCasesComponent;
  let fixture: ComponentFixture<ReadLinkedCasesComponent>;
  let commonDataService: any;
  let appConfig: any;
  let linkedCasesService: any;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    url: ''
  };

  const linkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseState: 'state',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    }
  ];

  linkedCasesService = {
    caseId: '1682374819203471',
    linkedCases: linkedCases
  };

  beforeEach(async(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getRDCommonDataApiUrl']);
    commonDataService = createSpyObj('commonDataService', ['getRefData']);
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: CommonDataService, useValue: commonDataService },
        { provide: AbstractAppConfig, useValue: appConfig },
        { provide: LinkedCasesService, useValue: linkedCasesService },
      ],
      declarations: [ReadLinkedCasesComponent],
    })
      .compileComponents();
  }));

  const linkCaseReasons: LovRefDataByServiceModel = {
    list_of_values: [
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
  ]};

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadLinkedCasesComponent);
    component = fixture.componentInstance;
    commonDataService.getRefData.and.returnValue(of(linkCaseReasons));
  });

  it('should map the linked cases reason for linked cases tab page', () => {
    component.ngOnInit();
    expect(commonDataService.getRefData).toHaveBeenCalled();
  });

  it('should call reloadcurrentroute when hyperlink is being clicked', () => {
    component.serverError = {id: '', message: ''};
    fixture.detectChanges();
    spyOn(component, 'reloadCurrentRoute');
    const reloadHyperlink = document.getElementById('reload-linked-cases-tab');
    reloadHyperlink.click();
    expect(component.reloadCurrentRoute).toHaveBeenCalled();
  });
});
