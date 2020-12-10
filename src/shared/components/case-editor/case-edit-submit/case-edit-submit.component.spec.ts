import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { aCaseField, createCaseField, createMultiSelectListFieldType } from '../../../fixture/shared.test.fixture';
import { IsCompoundPipe } from '../../palette/utils/is-compound.pipe';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { OrderService } from '../../../services/order/order.service';
import { aWizardPage } from '../case-edit.spec';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FormValueService } from '../../../services/form/form-value.service';
import { CaseEditSubmitComponent } from './case-edit-submit.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { ProfileService, ProfileNotifier } from '../../../services/profile';
import { FieldType, FixedListItem, Profile } from '../../../domain';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { text } from '../../../test/helpers';
import { FieldsPurger } from '../../../services';
import { WizardPageField } from '../domain';

describe('CaseEditSubmitComponent', () => {

  let comp: CaseEditSubmitComponent;
  let fixture: ComponentFixture<CaseEditSubmitComponent>;
  let de: DebugElement;

  const END_BUTTON_LABEL = 'Go now!';
  let formValueService: jasmine.SpyObj<FormValueService>;
  let formErrorService: jasmine.SpyObj<FormErrorService>;
  const caseFieldService = new CaseFieldService();
  const fieldsUtils: FieldsUtils = new FieldsUtils();
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({ 'PersonLastName': new FormControl('Khaleesi') })
  });
  const COMPLEX_ELEMENT_HIDDEN = new FormGroup({
    'childField1': new FormControl('1st child field of complex type (retain)'),
    'childField2': new FormControl('2nd child field of complex type (do not retain)')
  });
  COMPLEX_ELEMENT_HIDDEN.disable();
  const FORM_GROUP_WITH_HIDDEN_FIELDS = new FormGroup({
    'data': new FormGroup({
      'field1': new FormControl({ value: 'Hidden value to be retained', disabled: true }),
      'field2': new FormControl({ value: 'Hidden value not to be retained', disabled: true }),
      'field3': new FormControl('Hide all'),
      'complexField1': COMPLEX_ELEMENT_HIDDEN
    })
  });
  const MULTI_SELECT_ELEMENT_HIDDEN = new FormArray([
    new FormControl({ value: 'UK', disabled: true }),
    new FormControl({ value: 'US', disabled: true })
  ]);
  MULTI_SELECT_ELEMENT_HIDDEN.disable();
  const DOCUMENT_ELEMENT_HIDDEN = new FormGroup({
    'document_binary_url': new FormControl({ value: 'http://document_binary.url', disabled: true }),
    'document_filename': new FormControl({ value: 'document.dummy', disabled: true }),
    'document_url': new FormControl({ value: 'http://document.url', disabled: true })
  });
  DOCUMENT_ELEMENT_HIDDEN.disable();
  const FORM_GROUP_WITH_HIDDEN_MULTI_SELECT_AND_DOCUMENT_FIELDS = new FormGroup({
    'data': new FormGroup({
      'countrySelection': MULTI_SELECT_ELEMENT_HIDDEN,
      'documentField': DOCUMENT_ELEMENT_HIDDEN,
      'field3': new FormControl('Hide all')
    })
  });
  let caseEditComponent: any;
  let orderService: OrderService;
  let profileService: jasmine.SpyObj<ProfileService>;
  let profileNotifier: ProfileNotifier;
  let profileNotifierSpy: jasmine.Spy;
  let casesReferencePipe: jasmine.SpyObj<CaseReferencePipe>;
  const caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4);
  const caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', 3);
  const caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', 2);
  const complexSubField1: CaseField = aCaseField('childField1', 'childField1', 'Text', 'OPTIONAL', 1, null, true);
  const complexSubField2: CaseField = aCaseField('childField2', 'childField2', 'Text', 'OPTIONAL', 2);
  const complexCaseField: CaseField = aCaseField('complexField1', 'complexField1', 'Complex', 'OPTIONAL', 1,
    [complexSubField1, complexSubField2], true);
  const caseFieldRetainHiddenValue: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4, null, true);
  const countries: FixedListItem[] = [{code: 'UK', label: 'United Kingdom'}, {code: 'US', label: 'United States'}];
  const countryMultiSelectFieldType: FieldType = createMultiSelectListFieldType('countryCodes', countries);
  const countryMultiSelectField: CaseField = createCaseField('countrySelection', 'Country selection', '',
    countryMultiSelectFieldType, 'OPTIONAL', 1, null, null);
  const documentField = aCaseField('documentField', 'Dummy document', 'Document', 'OPTIONAL', 2, null, null);
  const $EVENT_NOTES = By.css('#fieldset-event');
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
    'isSolicitor': FUNC,
    'isCourtAdmin': FUNC,
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

  const $SELECT_ERROR_SUMMARY = By.css('.error-summary');
  const $SELECT_ERROR_HEADING_GENERIC = By.css('.error-summary>h1:first-child');
  const $SELECT_ERROR_MESSAGE_GENERIC = By.css('.govuk-error-summary__body>p:first-child');
  const $SELECT_ERROR_HEADING_SPECIFIC = By.css('.error-summary>h3:first-child');
  const $SELECT_ERROR_MESSAGE_SPECIFIC = By.css('.error-summary>p:nth-child(2)');
  const $SELECT_CALLBACK_DATA_FIELD_ERROR_LIST = By.css('.error-summary-list');
  const $SELECT_FIRST_FIELD_ERROR = By.css('li:first-child');
  const $SELECT_SECOND_FIELD_ERROR = By.css('li:nth-child(2)');

  const ERROR_HEADING_GENERIC = 'Something went wrong';
  const ERROR_MESSAGE_GENERIC = 'We\'re working to fix the problem. Try again shortly.';
  const ERROR_HEADING_SPECIFIC = 'The event could not be created'
  const ERROR_MESSAGE_SPECIFIC = 'There are field validation errors'

  describe('Save and Resume disabled', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
      aWizardPage('page2', 'Page 2', 2),
      aWizardPage('page3', 'Page 3', 3)
    ];
    const firstPage = pages[0];
    const wizard: Wizard = new Wizard(pages);
    beforeEach(async(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();

      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP,
        'data': '',
        'eventTrigger':
          {'case_fields': [caseField1, caseField2, caseField3], 'end_button_label': END_BUTTON_LABEL, 'can_save_draft': false},
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'cancel': () => undefined,
        'cancelled': cancelled,
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseFieldService, useValue: caseFieldService},
          {provide: FieldsUtils, useValue: fieldsUtils},
          {provide: CaseReferencePipe, useValue: casesReferencePipe},
          {provide: ActivatedRoute, useValue: mockRoute},
          {provide: OrderService, useValue: orderService},
          {provide: ProfileService, useValue: profileService},
          {provide: ProfileNotifier, useValue: profileNotifier}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should announce profile when profile exists on a path from root set by Router', () => {
      expect(profileNotifierSpy.calls.mostRecent().args[0].user).toEqual(USER);
      expect(profileNotifierSpy.calls.mostRecent().args[0].isSolicitor.toString()).toEqual(FUNC.toString());
      expect(profileService.get).not.toHaveBeenCalled();
    });

    it('must render correct button label', () => {
      let buttons = de.queryAll(By.css('div>button'));
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
      let changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'READONLY', null));
      expect(changeAllowed).toBeFalsy();
    });

    it('should allow changes for non READONLY fields', () => {
      let changeAllowed = comp.isChangeAllowed(aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null));
      expect(changeAllowed).toBeTruthy();
    });

    it('should return TRUE for canShowFieldInCYA when caseField show_summary_change_option is TRUE', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      let canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeTruthy();
    });

    it('should return FALSE for canShowFieldInCYA when caseField show_summary_change_option is FALSE', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = false;
      let canShow = comp.canShowFieldInCYA(caseField);
      expect(canShow).toBeFalsy();
    });

    it('should return lastPageShown', () => {
      spyOn(comp, 'navigateToPage').and.callThrough();

      comp.previous();

      expect(comp.navigateToPage).toHaveBeenCalled();
      expect(caseEditComponent.navigateToPage).toHaveBeenCalled();
    });

    it('should return false when no field exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      let result = comp.checkYourAnswerFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and checkYourAnswerFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_change_option = true;
      comp.wizard.pages[0].case_fields = [caseField];
      comp.eventTrigger.show_summary = true;

      let result = comp.checkYourAnswerFieldsToDisplayExists();
      expect(result).toBeTruthy();
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeTruthy();
    });

    it('should show event notes when set in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = true;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not set in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = null;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not defined in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should not show event notes when set to false in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = false;
      fixture.detectChanges();
      let eventNotes = de.query($EVENT_NOTES);

      let result = comp.showEventNotes();

      expect(result).toBeFalsy();
      expect(eventNotes).toBeNull();
    });

    it('should return false when no field exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      comp.eventTrigger.case_fields = [];
      fixture.detectChanges();

      let result = comp.readOnlySummaryFieldsToDisplayExists();

      expect(result).toBeFalsy();
    });

    it('should return true when no Fields to Display exists and readOnlySummaryFieldsToDisplayExists is called', () => {
      let caseField: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', null);
      caseField.show_summary_content_option = 3;
      comp.eventTrigger.case_fields = [caseField];

      let result = comp.readOnlySummaryFieldsToDisplayExists();

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
      let result = comp.getCancelText();
      expect(result).toBe('Cancel');
    });

    it('should disable submit button, previous button and cancel link when isSubmitting is set to true', () => {
      comp.isSubmitting = true;
      fixture.detectChanges();

      let submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeTruthy();

      let prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeTruthy();

      let cancelLink = de.query(By.css('a[class=disabled]'));
      expect(cancelLink.nativeElement).toBeTruthy();
    });

    it('should enable submit button, previous button and cancel link when isSubmitting is set to false', () => {
      comp.isSubmitting = false;
      fixture.detectChanges();

      let submitButton = de.query(By.css('button[type=submit]'));
      expect(submitButton.nativeElement.disabled).toBeFalsy();

      let prevButton = de.query(By.css('button[type=button]'));
      expect(prevButton.nativeElement.disabled).toBeFalsy();

      let cancelLink = de.query(By.css('a[class=disabled]'));
      expect(cancelLink).toBeNull();
    });
  });

  describe('CaseEditSubmitComponent without custom end button label and with Save and Resume enabled', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const wizard: Wizard = new Wizard(pages);
    let queryParamMapNoProfile = createSpyObj('queryParamMap', ['get']);
    let snapshotNoProfile = {
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
              'isSolicitor': () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);
    let mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };
    beforeEach(async(() => {
      orderService = new OrderService();
      spyOn(orderService, 'sort').and.callThrough();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP,
        'data': '',
        'eventTrigger': { 'case_fields': [], 'can_save_draft': true },
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'cancel': () => undefined,
        'cancelled': cancelled,
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      spyOn(caseEditComponent, 'navigateToPage');
      spyOn(caseEditComponent, 'cancel');

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileService.get.and.returnValue(PROFILE_OBS);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileService, useValue: profileService },
          { provide: ProfileNotifier, useValue: profileNotifier }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should announce profile when profile exists on a path from root set by Router', () => {
      expect(profileNotifierSpy.calls.mostRecent().args[0].user).toEqual(USER);
      expect(profileNotifierSpy.calls.mostRecent().args[0].isSolicitor.toString()).toEqual(FUNC.toString());
      expect(profileService.get).toHaveBeenCalled();
    });

    it('must render default button label when custom one is not supplied', () => {
      let buttons = de.queryAll(By.css('div>button'));
      expect(buttons[1].nativeElement.textContent.trim()).toEqual('Submit');
    });

    it('should emit RESUMED_FORM_DISCARD on create event if cancel triggered and originated from view case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    });

    it('should emit NEW_FORM_DISCARD on create event if cancel triggered and originated from create case', () => {
      queryParamMapNoProfile.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return '';
        }
      });
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    });

    it('should return "Return to case list" text label for cancel button when save and resume enabled', () => {
      let result = comp.getCancelText();
      expect(result).toBe('Return to case list');
    });
  });

  describe('Error message display tests', () => {
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
              'isSolicitor': () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(async(() => {
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP,
        'data': '',
        'eventTrigger': { 'case_fields': [], 'can_save_draft': true },
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'cancel': () => undefined,
        'cancelled': cancelled,
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileService.get.and.returnValue(PROFILE_OBS);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileService, useValue: profileService },
          { provide: ProfileNotifier, useValue: profileNotifier }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should display generic error heading and message when form error is set but no callback errors, warnings, or error details', () => {
      comp.error = {
        status: 200,
        callbackErrors: null,
        callbackWarnings: null,
        details: null
      } as HttpError;

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const error = de.query($SELECT_ERROR_SUMMARY);
        expect(error).toBeTruthy();

        const errorHeading = error.query($SELECT_ERROR_HEADING_GENERIC);
        expect(text(errorHeading)).toBe(ERROR_HEADING_GENERIC);

        const errorMessage = error.query($SELECT_ERROR_MESSAGE_GENERIC);
        expect(text(errorMessage)).toBe(ERROR_MESSAGE_GENERIC);
      });
    });

    it('should display specific error heading and message, and callback data field validation errors (if any)', () => {
      comp.error = {
        status: 422,
        callbackErrors: null,
        callbackWarnings: null,
        details: {
          field_errors: [
            {
              message: 'First field error'
            },
            {
              message: 'Second field error'
            }
          ]
        },
        message: 'There are field validation errors'
      } as HttpError;

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        const error = de.query($SELECT_ERROR_SUMMARY);
        expect(error).toBeTruthy();

        const errorHeading = error.query($SELECT_ERROR_HEADING_SPECIFIC);
        expect(text(errorHeading)).toBe(ERROR_HEADING_SPECIFIC);

        const errorMessage = error.query($SELECT_ERROR_MESSAGE_SPECIFIC);
        expect(text(errorMessage)).toBe(ERROR_MESSAGE_SPECIFIC);

        const fieldErrorList = de.query($SELECT_CALLBACK_DATA_FIELD_ERROR_LIST);
        expect(fieldErrorList).toBeTruthy();
        const firstFieldError = fieldErrorList.query($SELECT_FIRST_FIELD_ERROR);
        expect(text(firstFieldError)).toBe('First field error');
        const secondFieldError = fieldErrorList.query($SELECT_SECOND_FIELD_ERROR);
        expect(text(secondFieldError)).toBe('Second field error');
      });
    });

    it('should not display generic error heading and message when there are specific callback errors', () => {
      comp.error = {
        status: 422,
        callbackErrors: ['First error', 'Second error'],
        callbackWarnings: null,
        details: null
      } as HttpError;

      fixture.detectChanges();

      const error = de.query($SELECT_ERROR_SUMMARY);
      expect(error).toBeFalsy();
    });

    it('should not display generic error heading and message when there are specific callback warnings', () => {
      comp.error = {
        status: 422,
        callbackErrors: null,
        callbackWarnings: ['First warning', 'Second warning'],
        details: null
      } as HttpError;

      fixture.detectChanges();

      const error = de.query($SELECT_ERROR_SUMMARY);
      expect(error).toBeFalsy();
    });
  });

  describe('Form submit test', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    caseFieldRetainHiddenValue.show_condition = 'field3!="Hide all"';
    caseField2.show_condition = 'field3!="Hide all"';
    complexCaseField.show_condition = 'field3!="Hide all"';
    const WP_FIELD_1: WizardPageField = { case_field_id: caseFieldRetainHiddenValue.id };
    const WP_FIELD_2: WizardPageField = { case_field_id: caseField2.id };
    const WP_FIELD_3: WizardPageField = { case_field_id: caseField3.id };
    const WP_FIELD_4: WizardPageField = { case_field_id: complexCaseField.id };
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2, WP_FIELD_3, WP_FIELD_4];
    firstPage.case_fields = [caseFieldRetainHiddenValue, caseField2, caseField3, complexCaseField];
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
              'isSolicitor': () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(async(() => {
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP_WITH_HIDDEN_FIELDS,
        'fieldsPurger': new FieldsPurger(fieldsUtils),
        'data': '',
        'eventTrigger': {
          'case_fields': [caseFieldRetainHiddenValue, caseField2, caseField3, complexCaseField],
          'can_save_draft': true
        },
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'next': () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        'cancel': () => undefined,
        'cancelled': cancelled,
        'submit': createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);
      formValueService.sanitise.and.callFake((rawValue: object) => {
        return rawValue;
      });

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileService.get.and.returnValue(PROFILE_OBS);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueService },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileService, useValue: profileService },
          { provide: ProfileNotifier, useValue: profileNotifier }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should submit CaseEventData with null for any hidden fields (including sub-fields of Complex types) whose values are not to be retained', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field1: 'Hidden value to be retained',
          field2: null,
          field3: 'Hide all',
          complexField1: {
            childField1: '1st child field of complex type (retain)',
            childField2: null
          }
        },
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for MultiSelectList and Document field types', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    countryMultiSelectField.show_condition = 'field3!="Hide all"';
    documentField.show_condition = 'field3!="Hide all"';
    const WP_FIELD_1: WizardPageField = { case_field_id: countryMultiSelectField.id };
    const WP_FIELD_2: WizardPageField = { case_field_id: documentField.id };
    const WP_FIELD_3: WizardPageField = { case_field_id: caseField3.id };
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2, WP_FIELD_3];
    firstPage.case_fields = [countryMultiSelectField, documentField, caseField3];
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
              'isSolicitor': () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(async(() => {
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit'])
      caseEditComponent = {
        'form': FORM_GROUP_WITH_HIDDEN_MULTI_SELECT_AND_DOCUMENT_FIELDS,
        'fieldsPurger': new FieldsPurger(fieldsUtils),
        'data': '',
        'eventTrigger': {
          'case_fields': [countryMultiSelectField, documentField, caseField3],
          'can_save_draft': true
        },
        'wizard': wizard,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'navigateToPage': () => undefined,
        'next': () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        'cancel': () => undefined,
        'cancelled': cancelled,
        'submit': createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileService = createSpyObj<ProfileService>('profileService', ['get']);
      profileService.get.and.returnValue(PROFILE_OBS);
      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CaseReferencePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          { provide: CaseEditComponent, useValue: caseEditComponent },
          { provide: FormValueService, useValue: formValueServiceReal },
          { provide: FormErrorService, useValue: formErrorService },
          { provide: CaseFieldService, useValue: caseFieldService },
          { provide: FieldsUtils, useValue: fieldsUtils },
          { provide: CaseReferencePipe, useValue: casesReferencePipe },
          { provide: ActivatedRoute, useValue: mockRouteNoProfile },
          { provide: OrderService, useValue: orderService },
          { provide: ProfileService, useValue: profileService },
          { provide: ProfileNotifier, useValue: profileNotifier }
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should submit CaseEventData with null for the array of multi-select list fields and null for the entire Document field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          countrySelection: [],
          documentField: null,
          field3: 'Hide all',
        },
        event_token: undefined,
        ignore_warning: false
      });
    });
  });
});
