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
  let caseFieldValue = {
    '_list_items': [],
    'id': 'caseLinks',
    'label': 'Linked cases',
    'hidden': false,
    '_value': [
        {
            'id': '1651226230511462',
            'value': {
                'CaseType': 'Benefit_Xui',
                'CaseReference': '1651226230511462',
                'ReasonForLink': [
                    {
                        'id': '417eeb92-4b98-475a-8536-6e844719f09a',
                        'value': {
                            'Reason': 'CLRC007'
                        }
                    }
                ],
                'CreatedDateTime': '2022-07-20T18:48:37.079Z'
            }
        }
    ],
    'metadata': false,
    'hint_text': null,
    'field_type': {
        'id': 'caseLinks-388e9201-5198-4417-a0b3-49c9fa7bc0e5',
        'type': 'Collection',
        'min': null,
        'max': null,
        'regular_expression': null,
        'fixed_list_items': [],
        'complex_fields': [],
        'collection_field_type': {
            'id': 'CaseLink',
            'type': 'Complex',
            'min': null,
            'max': null,
            'regular_expression': null,
            'fixed_list_items': [],
            'complex_fields': [
                {
                    '_list_items': [],
                    'id': 'CaseReference',
                    'label': 'Case Reference',
                    'hidden': null,
                    'order': null,
                    'metadata': false,
                    'case_type_id': null,
                    'hint_text': null,
                    'field_type': {
                        'id': 'TextCaseReference',
                        'type': 'Text',
                        'min': null,
                        'max': null,
                        'regular_expression': '(?:^[0-9]{16}$|^\\d{4}-\\d{4}-\\d{4}-\\d{4}$)',
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': null
                    },
                    'security_classification': 'PUBLIC',
                    'live_from': null,
                    'live_until': null,
                    'show_condition': null,
                    'acls': null,
                    'complexACLs': [],
                    'display_context': null,
                    'display_context_parameter': null,
                    'retain_hidden_value': null,
                    'formatted_value': null,
                    'category_id': null
                },
                {
                    '_list_items': [],
                    'id': 'ReasonForLink',
                    'label': 'ReasonForLink',
                    'hidden': null,
                    'order': null,
                    'metadata': false,
                    'case_type_id': null,
                    'hint_text': null,
                    'field_type': {
                        'id': 'ReasonForLinkList',
                        'type': 'Collection',
                        'min': null,
                        'max': null,
                        'regular_expression': null,
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': {
                            'id': 'LinkReason',
                            'type': 'Complex',
                            'min': null,
                            'max': null,
                            'regular_expression': null,
                            'fixed_list_items': [],
                            'complex_fields': [
                                {
                                    '_list_items': [],
                                    'id': 'Reason',
                                    'label': 'Reason',
                                    'hidden': null,
                                    'order': null,
                                    'metadata': false,
                                    'case_type_id': null,
                                    'hint_text': null,
                                    'field_type': {
                                        'id': 'Text',
                                        'type': 'Text',
                                        'min': null,
                                        'max': null,
                                        'regular_expression': null,
                                        'fixed_list_items': [],
                                        'complex_fields': [],
                                        'collection_field_type': null
                                    },
                                    'security_classification': 'PUBLIC',
                                    'live_from': null,
                                    'live_until': null,
                                    'show_condition': null,
                                    'acls': null,
                                    'complexACLs': [],
                                    'display_context': null,
                                    'display_context_parameter': null,
                                    'retain_hidden_value': null,
                                    'formatted_value': null,
                                    'category_id': null
                                },
                                {
                                    '_list_items': [],
                                    'id': 'OtherDescription',
                                    'label': 'OtherDescription',
                                    'hidden': null,
                                    'order': null,
                                    'metadata': false,
                                    'case_type_id': null,
                                    'hint_text': null,
                                    'field_type': {
                                        'id': 'Text',
                                        'type': 'Text',
                                        'min': null,
                                        'max': null,
                                        'regular_expression': null,
                                        'fixed_list_items': [],
                                        'complex_fields': [],
                                        'collection_field_type': null
                                    },
                                    'security_classification': 'PUBLIC',
                                    'live_from': null,
                                    'live_until': null,
                                    'show_condition': null,
                                    'acls': null,
                                    'complexACLs': [],
                                    'display_context': null,
                                    'display_context_parameter': null,
                                    'retain_hidden_value': null,
                                    'formatted_value': null,
                                    'category_id': null
                                }
                            ],
                            'collection_field_type': null
                        }
                    },
                    'security_classification': 'PUBLIC',
                    'live_from': null,
                    'live_until': null,
                    'show_condition': null,
                    'acls': null,
                    'complexACLs': [],
                    'display_context': null,
                    'display_context_parameter': null,
                    'retain_hidden_value': null,
                    'formatted_value': null,
                    'category_id': null
                },
                {
                    '_list_items': [],
                    'id': 'CreatedDateTime',
                    'label': 'Created Date Time',
                    'hidden': null,
                    'order': null,
                    'metadata': false,
                    'case_type_id': null,
                    'hint_text': null,
                    'field_type': {
                        'id': 'DateTime',
                        'type': 'DateTime',
                        'min': null,
                        'max': null,
                        'regular_expression': null,
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': null
                    },
                    'security_classification': 'PUBLIC',
                    'live_from': null,
                    'live_until': null,
                    'show_condition': null,
                    'acls': null,
                    'complexACLs': [],
                    'display_context': null,
                    'display_context_parameter': null,
                    'retain_hidden_value': null,
                    'formatted_value': null,
                    'category_id': null
                },
                {
                    '_list_items': [],
                    'id': 'CaseType',
                    'label': 'Case Type',
                    'hidden': null,
                    'order': null,
                    'metadata': false,
                    'case_type_id': null,
                    'hint_text': null,
                    'field_type': {
                        'id': 'Text',
                        'type': 'Text',
                        'min': null,
                        'max': null,
                        'regular_expression': null,
                        'fixed_list_items': [],
                        'complex_fields': [],
                        'collection_field_type': null
                    },
                    'security_classification': 'PUBLIC',
                    'live_from': null,
                    'live_until': null,
                    'show_condition': null,
                    'acls': null,
                    'complexACLs': [],
                    'display_context': null,
                    'display_context_parameter': null,
                    'retain_hidden_value': null,
                    'formatted_value': null,
                    'category_id': null
                }
            ],
            'collection_field_type': null
        }
    },
    'validation_expr': null,
    'security_label': 'PUBLIC',
    'order': 1,
    'formatted_value': [
        {
            'id': '1651226230511462',
            'value': {
                'CaseType': 'Benefit_Xui',
                'CaseReference': '1651226230511462',
                'ReasonForLink': [
                    {
                        'id': '417eeb92-4b98-475a-8536-6e844719f09a',
                        'value': {
                            'Reason': 'CLRC007'
                        }
                    }
                ],
                'CreatedDateTime': '2022-07-20T18:48:37.079Z'
            }
        }
    ],
    'display_context': 'READONLY',
    'display_context_parameter': null,
    'show_condition': null,
    'show_summary_change_option': null,
    'show_summary_content_option': null,
    'retain_hidden_value': null,
    'publish': null,
    'publish_as': null,
    'acls': [
        {
            'create': true,
            'read': true,
            'update': true,
            'delete': true,
            'role': 'caseworker-sscs'
        },
        {
            'create': true,
            'read': true,
            'update': true,
            'delete': true,
            'role': 'caseworker-sscs-systemupdate'
        },
        {
            'create': true,
            'read': true,
            'update': true,
            'delete': true,
            'role': 'caseworker-sscs-superuser'
        },
        {
            'create': true,
            'read': true,
            'update': true,
            'delete': true,
            'role': 'caseworker-sscs-dwpresponsewriter'
        }
    ],
    'value': [
        {
            'id': '1651226230511462',
            'value': {
                'CaseType': 'Benefit_Xui',
                'CaseReference': '1651226230511462',
                'ReasonForLink': [
                    {
                        'id': '417eeb92-4b98-475a-8536-6e844719f09a',
                        'value': {
                            'Reason': 'CLRC007'
                        }
                    }
                ],
                'CreatedDateTime': '2022-07-20T18:48:37.079Z'
            }
        }
    ]
}

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
    component.caseField = caseFieldValue as any;
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
