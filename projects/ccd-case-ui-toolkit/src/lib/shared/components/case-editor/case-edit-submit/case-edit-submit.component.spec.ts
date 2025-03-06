import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { PlaceholderService } from '../../../directives/substitutor/services';

import { CaseField, CaseTab, Jurisdiction, Profile } from '../../../domain';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { CcdCaseTitlePipe } from '../../../pipes/case-title/ccd-case-title.pipe';
import { CcdCYAPageLabelFilterPipe } from '../../../pipes/complex/ccd-cyapage-label-filter.pipe';
import { CcdPageFieldsPipe } from '../../../pipes/complex/ccd-page-fields.pipe';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import {
  CaseFieldService,
  FieldsUtils,
  FormErrorService,
  FormValidatorsService,
  FormValueService,
  JurisdictionService,
  OrderService,
  ProfileNotifier,
  SearchService,
  SessionStorageService
} from '../../../services';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { IsCompoundPipe } from '../../palette/utils/is-compound.pipe';
import { CaseEditPageText } from '../case-edit-page/case-edit-page-text.enum';
import { aWizardPage } from '../case-edit.spec';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';
import { CaseNotifier } from '../services';
import { CaseEditSubmitTitles } from './case-edit-submit-titles.enum';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { CaseFlagStateService } from '../services/case-flag-state.service';
import { LinkedCasesService } from '../../palette/linked-cases/services/linked-cases.service';

import createSpyObj = jasmine.createSpyObj;
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';

describe('CaseEditSubmitComponent', () => {

  let comp: CaseEditSubmitComponent;
  let fixture: ComponentFixture<CaseEditSubmitComponent>;
  let de: DebugElement;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

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

  let sessionStorageService: any;
  const mockCaseNotifier: any = {};
  const task = `{
    "assignee": null,
    "auto_assigned": false,
    "case_category": "asylum",
    "case_id": "1234567812345678",
    "case_management_category": null,
    "case_name": "Alan Jonson",
    "case_type_id": null,
    "created_date": "2021-04-19T14:00:00.000+0000",
    "due_date": "2021-05-20T16:00:00.000+0000",
    "execution_type": null,
    "id": "0d22d838-b25a-11eb-a18c-f2d58a9b7bc6",
    "jurisdiction": "Immigration and Asylum",
    "location": null,
    "location_name": null,
    "name": "Task name",
    "permissions": null,
    "region": null,
    "security_classification": null,
    "task_state": null,
    "task_system": null,
    "task_title": "Some lovely task name",
    "type": null,
    "warning_list": null,
    "warnings": true,
    "work_type_id": null
  }`;

  const END_BUTTON_LABEL = 'Go now!';
  let formValueService: jasmine.SpyObj<FormValueService>;
  let formErrorService: jasmine.SpyObj<FormErrorService>;
  const caseFieldService = new CaseFieldService();
  const $EVENT_NOTES = By.css('#fieldset-event');
  const fieldsUtils = new FieldsUtils();
  const FORM_GROUP = new FormGroup({
    data: new FormGroup({ PersonLastName: new FormControl('Khaleesi') })
  });
  const COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED = '2nd child field of complex type (do not retain)';
  const COMPLEX_SUBFIELD_1_VALUE_EMPTY = '';
  const COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY = new FormGroup({
    childField1: new FormControl(COMPLEX_SUBFIELD_1_VALUE_EMPTY)
  });
  COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY.disable();
  const COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_NOT_RETAINED = new FormGroup({
    childField2: new FormControl(COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED)
  });
  COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_NOT_RETAINED.disable();



  let profileNotifierSpy: jasmine.Spy;
  let caseEditComponent: any;
  let orderService: OrderService;
  let profileNotifier: ProfileNotifier;
  let casesReferencePipe: jasmine.SpyObj<CaseReferencePipe>;
  let formValidatorsService: jasmine.SpyObj<FormValidatorsService>;
  let linkedCasesServiceSpy: jasmine.SpyObj<LinkedCasesService>;
  const caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4);
  const caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', 3, null, false, true);
  const caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', 2);
  let cancelled: any;
  const METADATA: CaseField[] = [
    Object.assign(new CaseField(), {
      id: '[CASE_REFERENCE]',
      label: 'Case Reference',
      value: 1533032330714079,
      hint_text: null,
      field_type: {
        id: 'Number',
        type: 'Number',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[CASE_TYPE]',
      label: 'Case Type',
      value: 'DIVORCE',
      hint_text: null,
      field_type: {
        id: 'Text',
        type: 'Text',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[CREATED_DATE]',
      label: 'Created Date',
      value: '2018-07-31T10:18:50.737',
      hint_text: null,
      field_type: {
        id: 'Date',
        type: 'Date',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[JURISDICTION]',
      label: 'Jurisdiction',
      value: 'DIVORCE',
      hint_text: null,
      field_type: {
        id: 'Text',
        type: 'Text',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[LAST_MODIFIED_DATE]',
      label: 'Last Modified Date',
      value: '2018-07-31T10:18:50.737',
      hint_text: null,
      field_type: {
        id: 'Date',
        type: 'Date',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[SECURITY_CLASSIFICATION]',
      label: 'Security Classification',
      value: 'PUBLIC',
      hint_text: null,
      field_type: {
        id: 'Text',
        type: 'Text',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    }),
    Object.assign(new CaseField(), {
      id: '[SECURITY_CLASSIFICATION]',
      label: 'Security Classification',
      value: 'PUBLIC',
      hint_text: null,
      field_type: {
        id: 'Text',
        type: 'Text',
        min: null,
        max: null,
        regular_expression: null,
        fixed_list_items: [],
        complex_fields: [],
        collection_field_type: null
      },
      security_label: 'PUBLIC',
      order: null,
      display_context: null,
      show_condition: null,
      show_summary_change_option: null,
      show_summary_content_option: null
    })
  ];

  const USER = {
    idam: {
      id: 'userId',
      email: 'string',
      forename: 'string',
      surname: 'string',
      roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
    }
  };
  const FUNC = () => false;
  const PROFILE: Profile = {
    channels: [],
    jurisdictions: [],
    default: {
      workbasket: {
        case_type_id: '',
        jurisdiction_id: '',
        state_id: ''
      }
    },
    user: USER,
    isSolicitor: FUNC,
    isCourtAdmin: FUNC,
  };

  const mockRoute: any = {
    snapshot: {
      data: {},
      params: {},
      pathFromRoot: [
        {},
        {
          data: {
            profile: PROFILE
          }
        }
      ]
    },
    params: of({})
  };



  describe('Save and Resume disabled', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
      aWizardPage('page2', 'Page 2', 2),
      aWizardPage('page3', 'Page 3', 3)
    ];
    const firstPage = pages[0];
    const wizard: Wizard = new Wizard(pages);
    const caseFlagStateService: CaseFlagStateService = new CaseFlagStateService();
    let caseFlagStateServiceSpy: jasmine.SpyObj<CaseFlagStateService>;
    beforeEach(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: FORM_GROUP,
        data: '',
        eventTrigger:
          { case_fields: [caseField1, caseField2, caseField3], end_button_label: END_BUTTON_LABEL, can_save_draft: false },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: METADATA, state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
        submitForm: () => ''
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);
      formValidatorsService = createSpyObj<FormValidatorsService>('formValidatorsService', ['addMarkDownValidators']);
      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');
      spyOn(caseEditComponent, 'submitForm');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      caseFlagStateServiceSpy = jasmine.createSpyObj('CaseFlagStateService', ['resetCache', 'resetInitialCaseFlags']);
      caseFlagStateServiceSpy.formGroup = FORM_GROUP;
      caseFlagStateServiceSpy.fieldStateToNavigate = 5;

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);
      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe,
          MockRpxTranslatePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorsService },
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRoute },
          { provide: OrderService, useValue: orderService },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: SessionStorageService, useValue: sessionStorageService },
          { provide: Router, useValue: mockRouter },
          PlaceholderService,
          { provide: CaseNotifier, useValue: mockCaseNotifier },
          { provide: LinkedCasesService, useValue: linkedCasesService },
          JurisdictionService,
          { provide: CaseFlagStateService, useValue: caseFlagStateServiceSpy }
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;

      comp.ngOnInit();
      comp.wizard.pages[0].case_fields = [caseField1];
    });

    it('must render correct button label', () => {
      fixture.detectChanges();
      const buttons = de.queryAll(By.css('div>button'));
      expect(buttons[1].nativeElement.textContent.trim()).toEqual(END_BUTTON_LABEL);
    });

    it('should delegate navigateToPage calls to caseEditComponent', () => {
      comp.navigateToPage('somePage');
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should delegate cancel calls to caseEditComponent if save and resume disabled', () => {
      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalled();
    });

    it('should not allow changes for READONLY fields', () => {
      const changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'READONLY', null));
      expect(changeAllowed).toBeFalsy();
    });

    it('should allow changes for non READONLY fields', () => {
      const changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null));
      expect(changeAllowed).toBeTruthy();
    });

    it('should return TRUE for canShowFieldInCYA when caseField show_summary_change_option is TRUE', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      const canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeTruthy();
    });

    it('should return FALSE for canShowFieldInCYA when caseField show_summary_change_option is FALSE', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = false;
      const canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeFalsy();
    });

    it('should return lastPageShown', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();

      comp.previous();

      expect(comp.navigateToPage).toHaveBeenCalled();
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should return lastPageShown and set the fieldStateToNavigate', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();
      spyOn(caseEditComponent, 'isCaseFlagSubmission').and.returnValue(true);
      caseFlagStateServiceSpy.lastPageFieldState = 1;
      comp.previous();

      expect(caseFlagStateServiceSpy.fieldStateToNavigate).toEqual(1);
      expect(comp.navigateToPage).toHaveBeenCalled();
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should return lastPageShown and set cameFromFinalStep if in linkedCaseSubmission', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();
      spyOn(caseEditComponent, 'isCaseFlagSubmission').and.returnValue(true);
      caseEditComponent.isLinkedCasesSubmission = true;
      comp.previous();

      expect(linkedCasesService.cameFromFinalStep).toBeTruthy();
      expect(comp.navigateToPage).toHaveBeenCalled();
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should reset the linkedCasesService values on cancel', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();
      spyOn(caseEditComponent, 'isCaseFlagSubmission').and.returnValue(true);
      spyOn(linkedCasesService, 'resetLinkedCaseData').and.callThrough();
      caseEditComponent.isLinkedCasesSubmission = true;
      comp.cancel();

      expect(linkedCasesService.resetLinkedCaseData).toHaveBeenCalled();
    });

    it('should return false when no field exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      const result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeFalsy();
    });

    it('should return false when show summary is false and checkYourAnswerFieldsToDisplayExists is called', () => {
      comp.eventTrigger.show_summary = false;
      const result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeFalsy();
    });

    it('should return true when show summary is null and checkYourAnswerFieldsToDisplayExists is called', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      comp.wizard.pages[0].case_fields = [caseField];
      comp.eventTrigger.show_summary = null;

      const result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeTruthy();
    });

    it('should return true when no Fields to Display exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      comp.wizard.pages[0].case_fields = [caseField];
      comp.eventTrigger.show_summary = true;

      const result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeTruthy();
    });

    it('should return true when no Fields to Display exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      comp.wizard.pages[0].case_fields = [caseField];
      comp.eventTrigger.show_summary = true;

      const result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeTruthy();
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      const result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      const result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeTruthy();
    });

    it('should show event notes when set in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not set in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = null;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should show event notes when not defined in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should not show event notes when set to false in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = false;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should show event notes when set in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.profile.user.idam.roles = ['caseworker-divorce'];
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);
      const result = comp.showEventNotes();
      expect(result).toEqual(true);
      expect(eventNotes).not.toBeNull();
    });

    it('should hide event notes when set in event trigger and profile is solicitor and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.profile.user.idam.roles = ['divorce-solicitor'];
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);
      const result = comp.showEventNotes();
      expect(result).toEqual(false);
      expect(eventNotes).toBeNull();
    });

    it('should hide event notes when set in event trigger and is case flag journey and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.profile.user.idam.roles = ['caseworker-divorce'];
      comp.caseEdit.isCaseFlagSubmission = true;
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);
      const result = comp.showEventNotes();
      expect(result).toEqual(false);
      expect(eventNotes).toBeNull();
    });

    it('should hide event notes when not set in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = null;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);
      const result = comp.showEventNotes();
      expect(result).toEqual(false);
      expect(eventNotes).toBeNull();
    });

    it('should hide event notes when not defined in event trigger and showEventNotes is called', () => {
      fixture.detectChanges();
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);
      const result = comp.showEventNotes();
      expect(result).toEqual(false);
      expect(eventNotes).toBeNull();
    });

    it('should set correct page title', () => {
      const caseFieldCaseFlagCreate: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(CREATE)', 2);
      const caseFieldCaseFlagUpdate: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(UPDATE)', 2);
      const caseFieldCaseFlagExternalCreate: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(CREATE,EXTERNAL)', 2);
      const caseFieldCaseFlagExternalUpdate: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(UPDATE,EXTERNAL)', 2);
      const caseFieldCaseFlagCreate2Point1: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(CREATE,VERSION2.1)', 2);
      const caseFieldCaseFlagUpdate2Point1: CaseField = aCaseField('FlagLauncher1', 'FlagLauncher1', 'FlagLauncher', '#ARGUMENT(UPDATE,VERSION2.1)', 2);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagExternalCreate
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_SUPPORT_REQUEST);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagExternalUpdate
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_SUPPORT_REQUEST);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagCreate
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_FLAG_DETAILS);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagUpdate
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_FLAG_DETAILS);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagCreate2Point1
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_FLAG_DETAILS);

      comp.eventTrigger.case_fields = [
        caseFieldCaseFlagUpdate2Point1
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.REVIEW_FLAG_DETAILS);

      comp.eventTrigger.case_fields = [
        caseField1
      ];
      comp.ngOnInit();
      expect(comp.pageTitle).toEqual(CaseEditSubmitTitles.CHECK_YOUR_ANSWERS);
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      const result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      const result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeTruthy();
    });

    it('should sort case fields with show_summary_content_option', () => {
      expect(comp.eventTrigger.case_fields[0].show_summary_content_option).toBe(4);
      expect(comp.eventTrigger.case_fields[1].show_summary_content_option).toBe(3);
      expect(comp.eventTrigger.case_fields[2].show_summary_content_option).toBe(2);
      expect(orderService.sort).toHaveBeenCalledWith(
        comp.eventTrigger.case_fields,
        CaseEditSubmitComponent.SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION);
      expect(comp.showSummaryFields.length).toBe(3);
      expect(comp.showSummaryFields[0].show_summary_content_option).toBe(2);
      expect(comp.showSummaryFields[1].show_summary_content_option).toBe(3);
      expect(comp.showSummaryFields[2].show_summary_content_option).toBe(4);
    });

    it('should return "Cancel" text label for cancel button when save and resume disabled', () => {
      const result = comp.getCancelText();
      expect(result).toBe('Cancel');
    });

    it('should disable submit button, previous button and cancel link when isSubmitting is set to true', () => {
      fixture.detectChanges();
      caseEditComponent.isSubmitting = true;
      fixture.detectChanges();

      // The isDisabled property should immediately pick up on this.
      expect(comp.isDisabled).toBeTruthy();

      const submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();

      const prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeTruthy();

      const cancelLink = de.query(By.css('a[class=disabled]'));
      expect(cancelLink.nativeElement).toBeTruthy();
    });

    it('should enable submit button, previous button and cancel link when isSubmitting is set to false', () => {
      fixture.detectChanges();
      caseEditComponent.isSubmitting = false;
      fixture.detectChanges();

      // The isDisabled property should immediately pick up on this.
      expect(comp.isDisabled).toBeFalsy();

      const submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();

      const prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeFalsy();

      const cancelLink = de.query(By.css('a[class=disabled]'));
      expect(cancelLink).toBeNull();
    });

    it('should display the "Previous" button if submission is not for a Case Flag', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();
      expect(comp.caseEdit.isCaseFlagSubmission).toBe(false);
      const previousButton = de.query(By.css('.button-secondary'));
      expect(previousButton.nativeElement.textContent).toContain('Previous');
    });

    it('should remove any unsubmitted data on cancel', () => {
      comp.caseEdit.caseDetails.tabs = [{
        id: '123',
        fields: [
          {
            id: 'caseLinks',
            value: [
              { value: { CaseReference: 'REF1' } },
              { value: { CaseReference: 'REF2' } },
              { value: { CaseReference: 'REF3' } }
            ]
          }
        ]
      }] as CaseTab[];
      caseEditComponent.isLinkedCasesSubmission = true;
      linkedCasesService.initialCaseLinkRefs = ['REF1'];
      comp.cancel();
      expect(comp.caseEdit.caseDetails.tabs[0].fields[0].value).toEqual([{ 'value': { 'CaseReference': 'REF1' } }]);
    });

    it('should add missing flags to formatted_value.details', () => {
      caseEditComponent.isCaseFlagSubmission = true;
      comp.editForm = {
        value: {
          data: {
            field1: {
              details: [{ id: 'flag1' }, { id: 'flag2' }]
            }
          }
        }
      } as FormGroup;
      comp.eventTrigger = {
        case_fields: [
          {
            id: 'field1',
            formatted_value: {
              details: [{ id: 'flag1' }]
            },
            _value: {
              details: []
            }
          }
        ]
      } as CaseEventTrigger;
      caseFlagStateServiceSpy.initialCaseFlags = {
        data: {
          field1: {
            details: [{ id: 'flag1' }, { id: 'flag2' }]
          }
        }
      };
      comp.checkExistingDataInSubmission();
      expect(comp.eventTrigger.case_fields[0].formatted_value.details.length).toBe(2);
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).toContain(jasmine.objectContaining({ id: 'flag1' }));
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).toContain(jasmine.objectContaining({ id: 'flag2' }));
    });

    it('should not add flags if they already exist in formatted_value.details', () => {
      caseEditComponent.isCaseFlagSubmission = true;
      comp.editForm = {
        value: {
          data: {
            field1: {
              details: [{ id: 'flag1' }]
            }
          }
        }
      } as FormGroup;
      comp.eventTrigger = {
        case_fields: [
          {
            id: 'field1',
            formatted_value: {
              details: [{ id: 'flag1' }]
            },
            _value: {
              details: [{ id: 'flag1' }]
            }
          }
        ]
      } as CaseEventTrigger;
      caseFlagStateServiceSpy.initialCaseFlags = {
        data: {
          field1: {
            details: [{ id: 'flag1' }]
          }
        }
      };
      comp.checkExistingDataInSubmission();
      expect(comp.eventTrigger.case_fields[0].formatted_value.details.length).toBe(1);
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).toContain({ id: 'flag1' });
    });

    it('should not modify details if priorFlags is undefined', () => {
      caseEditComponent.isCaseFlagSubmission = true;
      comp.editForm = {
        value: {
          data: {
            field1: {
              details: undefined
            }
          }
        }
      } as FormGroup;
      comp.eventTrigger = {
        case_fields: [
          {
            id: 'field1',
            formatted_value: {
              details: [{ id: 'flag1' }]
            },
            _value: {
              details: [{ id: 'flag1' }]
            }
          }
        ]
      } as CaseEventTrigger;
      caseFlagStateServiceSpy.initialCaseFlags = {
        data: {
          field1: {
            details: undefined
          }
        }
      };
      comp.checkExistingDataInSubmission();
      expect(comp.eventTrigger.case_fields[0].formatted_value.details.length).toBe(1);
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).toContain({ id: 'flag1' });
    });

    it('should filter out null ids from details', () => {
      caseEditComponent.isCaseFlagSubmission = true;
      comp.editForm = {
        value: {
          data: {
            field1: {
              details: [{ id: 'flag1' }, { id: null }]
            }
          }
        }
      } as FormGroup;
      comp.eventTrigger = {
        case_fields: [
          {
            id: 'field1',
            formatted_value: {
              details: [{ id: 'flag1' }, { id: null }]
            },
            _value: {
              details: [{ id: 'flag1' }, { id: null }]
            }
          }
        ]
      } as CaseEventTrigger;
      caseFlagStateServiceSpy.initialCaseFlags = {
        data: {
          field1: {
            details: [{ id: 'flag1' }, { id: null }]
          }
        }
      };
      comp.checkExistingDataInSubmission();
      expect(comp.eventTrigger.case_fields[0].formatted_value.details.length).toBe(1);
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).toContain({ id: 'flag1' });
      expect(comp.eventTrigger.case_fields[0].formatted_value.details).not.toContain({ id: null });
    });
  });

  describe('CaseEditSubmitComponent without custom end button label and with Save and Resume enabled', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const wizard: Wizard = new Wizard(pages);
    const queryParamMapNoProfile = createSpyObj('queryParamMap', ['get']);
    const snapshotNoProfile = {
      pathFromRoot: [
        {},
        {
          data: {
            nonProfileData: {
              user: {
                idam: {
                  id: 'userId',
                  email: 'string',
                  forename: 'string',
                  surname: 'string',
                  roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
                }
              },
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const mockRouteNoProfile = {
      params: of({ id: 123 }),
      snapshot: snapshotNoProfile
    };
    beforeEach(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: FORM_GROUP,
        data: '',
        eventTrigger: { case_fields: [], can_save_draft: true },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: METADATA, state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);
      formValidatorsService = createSpyObj<FormValidatorsService>('formValidatorsService', ['addMarkDownValidators']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

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

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CcdCYAPageLabelFilterPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe,
          MockRpxTranslatePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorsService },
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: SessionStorageService, useValue: sessionStorageService },
          { provide: Router, useValue: mockRouter },
          PlaceholderService,
          { provide: CaseNotifier, useValue: mockCaseNotifier },
          CaseFlagStateService,
          { provide: LinkedCasesService, useValue: linkedCasesService },
          JurisdictionService
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('must render default button label when custom one is not supplied', () => {
      const buttons = de.queryAll(By.css('div>button'));
      expect(buttons[1].nativeElement.textContent.trim()).toEqual('Submit');
    });

    it('should emit RESUMED_FORM_DISCARD on create event if cancel triggered and originated from view case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
      // tslint:disable-next-line: switch-default
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({ status: CaseEditPageText.RESUMED_FORM_DISCARD });
      expect(cancelled.emit).not.toHaveBeenCalledWith({ status: CaseEditPageText.NEW_FORM_DISCARD });
    });

    it('should emit NEW_FORM_DISCARD on create event if cancel triggered and originated from create case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
      // tslint:disable-next-line: switch-default
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return '';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({ status: CaseEditPageText.NEW_FORM_DISCARD });
      expect(cancelled.emit).not.toHaveBeenCalledWith({ status: CaseEditPageText.RESUMED_FORM_DISCARD });
    });

    it('should return "Return to case list" text label for cancel button when save and resume enabled', () => {
      const result = comp.getCancelText();
      expect(result).toBe('Return to case list');
    });

    it('should have metadata Fields along with other fields', () => {
      expect(comp.metadataFieldsObject).toBeDefined();
      expect(comp.allFieldsValues).toBeDefined();
      expect(comp.allFieldsValues['[CASE_TYPE]']).toBe('DIVORCE');
    });

    it('should show valid title on the page', () => {
      const title = comp.getCaseTitle();
      expect(title).toEqual('# 12345678123456: west');
    });
  });

  describe('public methods', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const wizard: Wizard = new Wizard(pages);
    const queryParamMapNoProfile = createSpyObj('queryParamMap', ['get']);
    const snapshotNoProfile = {
      pathFromRoot: [
        {},
        {
          data: {
            nonProfileData: {
              user: {
                idam: {
                  id: 'userId',
                  email: 'string',
                  forename: 'string',
                  surname: 'string',
                  roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
                }
              },
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const mockRouteNoProfile = {
      params: of({ id: 123 }),
      snapshot: snapshotNoProfile
    };
    beforeEach(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: FORM_GROUP,
        data: '',
        eventTrigger: { case_fields: [], can_save_draft: true },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: METADATA, state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
        submitForm: () => '',
        onEventCanBeCompleted: () => '',
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);
      formValidatorsService = createSpyObj<FormValidatorsService>('formValidatorsService', ['addMarkDownValidators']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');
      spyOn(caseEditComponent, 'submitForm');
      spyOn(caseEditComponent, 'onEventCanBeCompleted');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

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

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CcdCYAPageLabelFilterPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe,
          MockRpxTranslatePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          { provide: FormValidatorsService, useValue: formValidatorsService },
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileNotifier, useValue: profileNotifier },
          { provide: SessionStorageService, useValue: sessionStorageService },
          { provide: Router, useValue: mockRouter },
          PlaceholderService,
          { provide: CaseNotifier, useValue: mockCaseNotifier },
          CaseFlagStateService,
          { provide: LinkedCasesService, useValue: linkedCasesService },
          JurisdictionService
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    describe('submit', () => {
      it('should call caseEdits submitForm', () => {
        comp.summary = new FormControl('ValidSummaryValue');
        comp.description = new FormControl('ValidDescriptionValue');

        comp.submit();
        expect(caseEditComponent.submitForm).toHaveBeenCalled();
      });
    });

    describe('onEventCanBeCompleted', () => {
      it('should call caseEdits onEventCanBeCompleted', () => {
        comp.onEventCanBeCompleted(true);
        expect(caseEditComponent.onEventCanBeCompleted).toHaveBeenCalled();
      });
    });

    describe('isLabel', () => {
      it('should call caseFieldServices isLabel', () => {
        spyOn(caseFieldService, 'isLabel');
        const fieldSample = { id: 'sample' } as unknown as CaseField;
        comp.isLabel(fieldSample);
        expect(caseFieldService.isLabel).toHaveBeenCalled();
      });
    });

    describe('callbackErrorsNotify', () => {
      it('should update triggerText and caseEdits ignoreWarning', () => {
        const sampleCallbackErrorsContext = {
          triggerText: 'trigger text',
          ignoreWarning: true
        };
        comp.callbackErrorsNotify(sampleCallbackErrorsContext);
        expect(caseEditComponent.ignoreWarning).toEqual(sampleCallbackErrorsContext.ignoreWarning);
        expect(comp.triggerText).toEqual(sampleCallbackErrorsContext.triggerText);
      });
    });
  });
});