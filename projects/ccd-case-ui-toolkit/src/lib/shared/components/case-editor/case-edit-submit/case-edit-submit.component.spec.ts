import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { PlaceholderService } from '../../../directives/substitutor/services';

import { CaseField, Profile } from '../../../domain';
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
  FormValueService,
  OrderService,
  ProfileNotifier,
  SessionStorageService
} from '../../../services';
import { IsCompoundPipe } from '../../palette/utils/is-compound.pipe';
import { CaseEditPageText } from '../case-edit-page/case-edit-page-text.enum';
import { aWizardPage } from '../case-edit.spec';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';
import { CaseNotifier } from '../services';
import { CaseEditSubmitComponent } from './case-edit-submit.component';

import createSpyObj = jasmine.createSpyObj;

describe('CaseEditSubmitComponent', () => {

  let comp: CaseEditSubmitComponent;
  let fixture: ComponentFixture<CaseEditSubmitComponent>;
  let de: DebugElement;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

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
    data: new FormGroup({PersonLastName: new FormControl('Khaleesi')})
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
  const caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4);
  const caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', 3, null, false, true);
  const caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', 2);
  let cancelled: any;

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
    beforeEach(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: FORM_GROUP,
        data: '',
        eventTrigger:
          {case_fields: [caseField1, caseField2, caseField3], end_button_label: END_BUTTON_LABEL, can_save_draft: false},
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
        submitForm: () => '',
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');
      spyOn(caseEditComponent, 'submitForm');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

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
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseFieldService, useValue: caseFieldService},
          {provide: FieldsUtils, useValue: fieldsUtils},
          {provide: CaseReferencePipe, useValue: casesReferencePipe},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: ProfileNotifier, useValue: profileNotifier},
          {provide: SessionStorageService, useValue: sessionStorageService},
          {provide: Router, useValue: mockRouter},
          PlaceholderService,
          {provide: CaseNotifier, useValue: mockCaseNotifier},
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;

      comp.ngOnInit();
      fixture.detectChanges();
    });

    it('must render correct button label', () => {
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

    it('should return false when no field exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      const result = comp.checkYourAnswerFieldsToDisplayExists();

      expect(result).toBeFalsy();
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
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not set in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = null;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should show event notes when not defined in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should not show event notes when set to false in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = false;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
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
      params: of({id: 123}),
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
        eventTrigger: {case_fields: [], can_save_draft: true},
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: [], state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CcdCYAPageLabelFilterPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseFieldService, useValue: caseFieldService},
          {provide: FieldsUtils, useValue: fieldsUtils},
          {provide: CaseReferencePipe, useValue: casesReferencePipe},
          {provide: ActivatedRoute, useValue: mockRouteNoProfile},
          {provide: OrderService, useValue: orderService},
          {provide: ProfileNotifier, useValue: profileNotifier},
          {provide: SessionStorageService, useValue: sessionStorageService},
          {provide: Router, useValue: mockRouter},
          PlaceholderService,
          {provide: CaseNotifier, useValue: mockCaseNotifier},
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
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageText.RESUMED_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageText.NEW_FORM_DISCARD});
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
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageText.NEW_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageText.RESUMED_FORM_DISCARD});
    });

    it('should return "Return to case list" text label for cancel button when save and resume enabled', () => {
      const result = comp.getCancelText();
      expect(result).toBe('Return to case list');
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
      params: of({id: 123}),
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
        eventTrigger: {case_fields: [], can_save_draft: true},
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: [], state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        ignoreWarning: false,
        isEventCompletionChecksRequired: false,
        isSubmitting: false,
        getCaseId: () => '',
        submitForm: () => '',
        onEventCanBeCompleted: () => '',
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');
      spyOn(caseEditComponent, 'submitForm');
      spyOn(caseEditComponent, 'onEventCanBeCompleted');

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CcdCYAPageLabelFilterPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseFieldService, useValue: caseFieldService},
          {provide: FieldsUtils, useValue: fieldsUtils},
          {provide: CaseReferencePipe, useValue: casesReferencePipe},
          {provide: ActivatedRoute, useValue: mockRouteNoProfile},
          {provide: OrderService, useValue: orderService},
          {provide: ProfileNotifier, useValue: profileNotifier},
          {provide: SessionStorageService, useValue: sessionStorageService},
          {provide: Router, useValue: mockRouter},
          PlaceholderService,
          {provide: CaseNotifier, useValue: mockCaseNotifier},
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    describe('submit', () => {
      it('should call caseEdits submitForm', () => {
        comp.submit();
        expect(caseEditComponent.submitForm).toHaveBeenCalled();
      })
    })

    describe('onEventCanBeCompleted', () => {
      it('should call caseEdits onEventCanBeCompleted', () => {
        comp.onEventCanBeCompleted(true);
        expect(caseEditComponent.onEventCanBeCompleted).toHaveBeenCalled();
      })
    })

    describe('isLabel', () => {
      it('should call caseFieldServices isLabel', () => {
        spyOn(caseFieldService, 'isLabel');
        const fieldSample = { id: 'sample' } as unknown as CaseField;
        comp.isLabel(fieldSample);
        expect(caseFieldService.isLabel).toHaveBeenCalled();
      })
    })

    describe('callbackErrorsNotify', () => {
      it('should update triggerText and caseEdits ignoreWarning', () => {
        const sampleCallbackErrorsContext = {
          triggerText: 'trigger text',
          ignoreWarning: true
        };
        comp.callbackErrorsNotify(sampleCallbackErrorsContext);
        expect(caseEditComponent.ignoreWarning).toEqual(sampleCallbackErrorsContext.ignoreWarning);
        expect(comp.triggerText).toEqual(sampleCallbackErrorsContext.triggerText);
      })
    })
  });
});
