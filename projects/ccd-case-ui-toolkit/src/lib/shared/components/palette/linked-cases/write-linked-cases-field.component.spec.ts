import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { CaseView } from '../../../domain/case-view';
import { CaseField } from '../../../domain/definition/case-field.model';
import { Draft } from '../../../domain/draft.model';
import { AddressesService, FieldsUtils, LoadingService, MultipageComponentStateService, SearchService } from '../../../services';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { CommonDataService, LovRefDataByServiceModel } from '../../../services/common-data-service/common-data-service';
import { FieldTypeSanitiser } from '../../../services/form/field-type-sanitiser';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FormValueService } from '../../../services/form/form-value.service';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../../case-editor/case-edit/case-edit.component';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';
import { Wizard } from '../../case-editor/domain/wizard.model';
import { CasesService } from '../../case-editor/services/cases.service';
import { PageValidationService } from '../../case-editor/services/page-validation.service';
import { CaseLink, LinkedCasesState } from './domain';
import { LinkedCasesPages } from './enums';
import { LinkedCasesService } from './services';
import { WriteLinkedCasesFieldComponent } from './write-linked-cases-field.component';

import createSpyObj = jasmine.createSpyObj;
import { ServiceOrg } from '../../../domain/case-view/service-org-response.model';
import { ValidPageListCaseFieldsService } from '../../case-editor/services/valid-page-list-caseFields.service';
import { JurisdictionService } from '../../../services/jurisdiction/jurisdiction.service';
import { Jurisdiction } from '../../../domain/definition/jurisdiction.model';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';

describe('WriteLinkedCasesFieldComponent', () => {
  let component: WriteLinkedCasesFieldComponent;
  let fixture: ComponentFixture<WriteLinkedCasesFieldComponent>;
  let caseEditPageComponent: CaseEditPageComponent;
  let caseEditComponentStub: any;
  let casesService: any;
  const dialog: any = undefined;
  let route: any;
  let commonDataService: any;
  let caseEditDataService: any;
  let appConfig: any;

  const router = {
    url: 'linkCases'
  };

  const someObservable = {
    subscribe: () => new Draft()
  };
  const caseField2 = new CaseField();
  const cancelled = createSpyObj('cancelled', ['emit']);
  const FORM_GROUP = new FormGroup({
    data: new FormGroup({ field1: new FormControl('SOME_VALUE') })
  });
  const wizardPage = createWizardPage([createCaseField('field1', 'field1Value')], false, 0);
  const WIZARD = new Wizard([wizardPage]);
  const caseField1 = new CaseField();
  const firstPage = new WizardPage();
  caseEditComponentStub = {
    form: FORM_GROUP,
    wizard: WIZARD,
    data: '',
    eventTrigger: { case_fields: [caseField1], name: 'Test event trigger name', can_save_draft: true },
    hasPrevious: () => true,
    getPage: () => firstPage,
    first: () => true,
    next: () => true,
    previous: () => true,
    cancel: () => undefined,
    cancelled,
    validate: (caseEventData: CaseEventData) => of(caseEventData),
    saveDraft: (_: CaseEventData) => of(someObservable),
    caseDetails: { case_id: '1234567812345678', tabs: [], metadataFields: [caseField2] }
  };
  route = {
    params: of({ id: 123 }),
    snapshot: {
      queryParamMap: createSpyObj('queryParamMap', ['get'])
    }
  };
  const fieldTypeSanitiser = new FieldTypeSanitiser();
  const formValueService = new FormValueService(fieldTypeSanitiser);
  const formErrorService = new FormErrorService();
  const caseFieldService = new CaseFieldService();
  const pageValidationService = new PageValidationService(caseFieldService);
  const fieldUtils = new FieldsUtils();
  const validPageListCaseFieldsService = new ValidPageListCaseFieldsService(fieldUtils);
  const multipageComponentStateService = new MultipageComponentStateService();
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

  caseEditPageComponent = new CaseEditPageComponent(caseEditComponentStub,
    route,
    formValueService,
    formErrorService,
    null,
    pageValidationService,
    dialog,
    caseFieldService,
    new CaseEditDataService(),
    new LoadingService(),
    validPageListCaseFieldsService,
    multipageComponentStateService,
    new AddressesService(null, null),
    new LinkedCasesService(jurisdictionService as any, searchService),
    new CaseFlagStateService());
  const caseInfo = {
    case_id: '1682374819203471',
    case_type: {
      name: 'SSCS type',
      jurisdiction: { name: '' }
    },
    state: { name: 'With FTA' },
    tabs: [
      {
        id: 'CaseLinksTab',
        fields: [
          {
            id: 'caseLinks',
            field_type: {
              collection_field_type: {
                id: 'CaseLink'
              }
            },
            value: [
              {
                caseReference: '1652112127295261',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'bail',
                    OtherDescription: ''
                  }
                ]
              },
              {
                caseReference: '1652111610080172',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'consolidated',
                    OtherDescription: ''
                  }
                ]
              },
              {
                caseReference: '1652111179220086',
                modified_date_time: '2022-05-10',
                caseType: 'Benefit_SCSS',
                reasons: [
                  {
                    reasonCode: 'progressed',
                    OtherDescription: ''
                  },
                  {
                    reasonCode: 'familial',
                    OtherDescription: ''
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };

  const linkedCases: CaseLink[] = [
    {
      caseReference: '1682374819203471',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1',
      unlink: true
    },
    {
      caseReference: '1682897456391875',
      reasons: [],
      createdDateTime: '',
      caseType: 'SSCS',
      caseTypeDescription: 'SSCS case type',
      caseState: 'state',
      caseStateDescription: 'state description',
      caseService: 'Tribunal',
      caseName: 'SSCS 2.1'
    }
  ];

  const caseFieldValue = [
    {
      id: '1682897456391875',
      value: {
        CaseReference: '1682897456391875',
        CaseType: 'SSCS',
        CreatedDateTime: '2024-12-11T10:20:31.549',
        ReasonForLink: [{
          id: '1b2ff4a8-df50-4a15-a476-90ed324de0aa',
          value: {
            OtherDescription: '',
            Reason: 'CLRC002'
          }
        }]
      }
    },
    {
      id: '1682374819203471',
      value: {
        CaseReference: '1682374819203471',
        CaseType: 'SSCS',
        CreatedDateTime: '2024-12-11T10:20:31.549',
        ReasonForLink: [{
          id: '1d2ff4a8-df50-4a15-a476-90ed324de0aa',
          value: {
            OtherDescription: '',
            Reason: 'CLRC002'
          }
        }]
      }
    }
  ];

  const linkedCasesService = {
    caseId: '1682374819203471',
    isLinkedCasesEventTrigger: true,
    caseFieldValue,
    linkedCases,
    caseFieldValue: linkedCases,
    cameFromFinalStep: false,
    getAllLinkedCaseInformation() { },
    getCaseName() { }
  };

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
        from: 'exui-default'
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
        from: 'exui-default'
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
        from: 'exui-default'
      }
    ]
  };

  const serviceOrgData: ServiceOrg[] = [
    {
      business_are: 'area',
      ccd_case_types: 'case Type',
      ccd_service_name: 'case name',
      jurisdiction: 'Civil',
      last_update: '22/08/1999',
      org_unit: 'unit',
      service_code: 'code',
      service_description: 'description',
      service_id: 39,
      service_short_description: 'short descr',
      sub_business_area: 'buss area'
    }
  ];

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getRDCommonDataApiUrl']);
    commonDataService = createSpyObj('commonDataService', ['getRefData', 'getServiceOrgData']);
    casesService = createSpyObj('CasesService', ['getCaseViewV2']);
    caseEditDataService = new CaseEditDataService();
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        WriteLinkedCasesFieldComponent
      ],
      providers: [
        { provide: Router, useValue: router },
        { provide: CaseEditComponent, useValue: caseEditComponentStub },
        { provide: CasesService, useValue: casesService },
        { provide: LinkedCasesService, useValue: linkedCasesService },
        { provide: CommonDataService, useValue: commonDataService },
        { provide: CaseEditDataService, useValue: caseEditDataService },
        { provide: AbstractAppConfig, useValue: appConfig }
      ]
    })
      .compileComponents();
    commonDataService.getRefData.and.returnValue(of(linkCaseReasons));
    commonDataService.getServiceOrgData.and.returnValue(of(serviceOrgData));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteLinkedCasesFieldComponent);
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    component = fixture.componentInstance;
    spyOn(caseEditPageComponent, 'getCaseId').and.returnValue(of('1111222233334444'));
    spyOn(caseEditDataService, 'clearFormValidationErrors').and.callThrough();
    component.formGroup = FORM_GROUP;
    fixture.detectChanges();
  });

  it('should create component', () => {
    spyOn(caseEditDataService, 'caseDetails$').and.returnValue(of(caseInfo));
    spyOn(component, 'initialiseCaseDetails');
    expect(component).toBeTruthy();
  });

  it('should initialise get OrgService', () => {
    spyOn(component, 'getLinkedCaseReasons').and.returnValue(of(serviceOrgData));
    component.getOrgService();
    expect(component.getLinkedCaseReasons).toHaveBeenCalledWith(serviceOrgData[0].service_code);
  });

  it('should initialise case details', () => {
    spyOn(component, 'getLinkedCases');
    spyOn(linkedCasesService, 'getCaseName').and.returnValue('case name');
    const caseView = caseInfo as CaseView;
    component.initialiseCaseDetails(caseView);
    expect(linkedCasesService.getCaseName).toHaveBeenCalled();
    expect(component.getLinkedCases).toHaveBeenCalled();
  });

  it('should have called pre-required data', () => {
    commonDataService.getRefData.and.returnValue(of(linkCaseReasons));
    commonDataService.getServiceOrgData.and.returnValue(of(serviceOrgData));
    casesService.getCaseViewV2.and.returnValue(of(caseInfo));
    expect(component.ngOnInit).toBeTruthy();
    expect(linkedCasesService.linkedCases.length).not.toBeNull();
    expect(component.isAtFinalPage()).toBe(false);
  });

  it('should isAtFinalState return correct state', () => {
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalPage()).toEqual(true);
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalPage()).toEqual(false);
  });

  it('should validate linked cases state emitter when navigate to next page is true', () => {
    spyOn(component, 'proceedToNextPage');
    spyOn(linkedCasesService, 'isLinkedCasesEventTrigger').and.returnValue(true);
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    const linkedCasesState: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    };
    component.onLinkedCasesStateEmitted(linkedCasesState);
    expect(component.proceedToNextPage).toHaveBeenCalled();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
  });

  it('should validate linked cases state emitter when navigate to next page is false', () => {
    spyOn(component, 'proceedToNextPage');
    spyOn(linkedCasesService, 'isLinkedCasesEventTrigger').and.returnValue(true);
    spyOn(caseEditDataService, 'addFormValidationError').and.callThrough();
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    const linkedCasesState: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      errorMessages: [{ title: 'Error title', description: 'Error descriptiom' }],
      navigateToNextPage: false
    };
    component.onLinkedCasesStateEmitted(linkedCasesState);
    expect(component.proceedToNextPage).not.toHaveBeenCalled();
    expect(caseEditDataService.addFormValidationError).toHaveBeenCalledTimes(1);
  });

  it('should navigate to correct page', () => {
    spyOn(caseEditDataService, 'setLinkedCasesJourneyAtFinalStep');
    spyOn(component.formGroup, 'updateValueAndValidity');
    spyOn(component, 'submitLinkedCases');
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    component.proceedToNextPage();
    expect(caseEditDataService.setLinkedCasesJourneyAtFinalStep).toHaveBeenCalledWith(false);
    expect(component.formGroup.updateValueAndValidity).not.toHaveBeenCalled();
    expect(component.submitLinkedCases).not.toHaveBeenCalled();
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.proceedToNextPage();
    expect(caseEditDataService.setLinkedCasesJourneyAtFinalStep).toHaveBeenCalledWith(true);
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
    expect(component.submitLinkedCases).toHaveBeenCalled();
  });

  it('should submit linked cases', () => {
    spyOn(caseEditDataService, 'setCaseEditForm');
    linkedCasesService.isLinkedCasesEventTrigger = true;
    component.caseEditForm = FORM_GROUP;
    component.submitLinkedCases();
    expect(component.formGroup.value.data.caseLinks).toEqual(caseFieldValue);
    expect(caseEditDataService.setCaseEditForm).toHaveBeenCalled();
  });

  it('should submit unlinked cases', () => {
    spyOn(caseEditDataService, 'setCaseEditForm');
    linkedCasesService.isLinkedCasesEventTrigger = false;
    linkedCasesService.linkedCases = linkedCases;
    component.caseEditForm = FORM_GROUP;
    component.submitLinkedCases();
    expect(component.formGroup.value.data.caseLinks[0]).toEqual(caseFieldValue[0]);
    expect(caseEditDataService.setCaseEditForm).toHaveBeenCalled();
  });

  it('should isAtFinalPage return correct value', () => {
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalPage()).toBe(false);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalPage()).toBe(true);
  });

  it('should getNextPage return correct page', () => {
    const linkedCasesState1: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.getNextPage(linkedCasesState1)).toEqual(LinkedCasesPages.UNLINK_CASE);

    const linkedCasesState2: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.LINK_CASE;
    expect(component.getNextPage(linkedCasesState2)).toEqual(LinkedCasesPages.CHECK_YOUR_ANSWERS);
  });

  it('should fetch caseView, filter tabs, and initialize linked cases correctly', () => {
    component.getLinkedCases();

    expect(component.linkedCasesPage).toBe(LinkedCasesPages.BEFORE_YOU_START);
  });

  function createCaseField(id: string, value: any, displayContext = 'READONLY'): CaseField {
    const cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.display_context = displayContext;
    return cf;
  }

  function createWizardPage(fields: CaseField[], isMultiColumn = false, order = 0): WizardPage {
    const wp: WizardPage = new WizardPage();
    wp.case_fields = fields;
    wp.label = 'Test Label';
    wp.getCol1Fields = () => fields;
    wp.getCol2Fields = () => fields;
    wp.isMultiColumn = () => isMultiColumn;
    wp.order = order;
    return wp;
  }

  it('should decrement linkedCasesPage when not on CHECK_YOUR_ANSWERS or LINK_CASE', () => {
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START + 1;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should set linkedCasesPage to LINK_CASE when on CHECK_YOUR_ANSWERS', () => {
    spyOn(linkedCasesService, 'isLinkedCasesEventTrigger').and.returnValue(true);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
  });

  it('should set linkedCasesPage to BEFORE_YOU_START when on LINK_CASE', () => {
    spyOn(linkedCasesService, 'isLinkedCasesEventTrigger').and.returnValue(true);
    component.linkedCasesPage = LinkedCasesPages.LINK_CASE;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should set linkedCasesPage to LINK_CASE when on CHECK_YOUR_ANSWERS and isLinkedCasesEventTrigger is true', () => {
    linkedCasesService.isLinkedCasesEventTrigger = true;
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
  });

  it('should set linkedCasesPage to BEFORE_YOU_START when on LINK_CASE and isLinkedCasesEventTrigger is true', () => {
    linkedCasesService.isLinkedCasesEventTrigger = true;
    component.linkedCasesPage = LinkedCasesPages.LINK_CASE;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should decrement linkedCasesPage when not on CHECK_YOUR_ANSWERS or LINK_CASE and isLinkedCasesEventTrigger is true', () => {
    linkedCasesService.isLinkedCasesEventTrigger = true;
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START + 1;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should set linkedCasesPage to BEFORE_YOU_START when on UNLINK_CASE and isLinkedCasesEventTrigger is false', () => {
    linkedCasesService.isLinkedCasesEventTrigger = false;
    component.linkedCasesPage = LinkedCasesPages.UNLINK_CASE;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should set linkedCasesPage to UNLINK_CASE when on CHECK_YOUR_ANSWERS and isLinkedCasesEventTrigger is false', () => {
    linkedCasesService.isLinkedCasesEventTrigger = false;
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.UNLINK_CASE);
  });

  it('should decrement linkedCasesPage when not on CHECK_YOUR_ANSWERS or UNLINK_CASE and isLinkedCasesEventTrigger is false', () => {
    linkedCasesService.isLinkedCasesEventTrigger = false;
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START + 1;
    component.previousPage();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.BEFORE_YOU_START);
  });

  it('should set linkedCasesPage and journeyPageNumber to CHECK_YOUR_ANSWERS if cameFromFinalStep is true', () => {
    linkedCasesService.cameFromFinalStep = true;
    spyOn(caseEditDataService, 'setLinkedCasesJourneyAtFinalStep');
    component.ngOnInit();
    expect(component.linkedCasesPage).toEqual(LinkedCasesPages.CHECK_YOUR_ANSWERS);
    expect(component.journeyPageNumber).toEqual(LinkedCasesPages.CHECK_YOUR_ANSWERS);
    expect(caseEditDataService.setLinkedCasesJourneyAtFinalStep).toHaveBeenCalledWith(true);
  });
});
