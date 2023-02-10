import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PlaceholderService } from '../../../directives/substitutor/services';

import { CaseField, CaseView, FieldType, FixedListItem, HttpError, Profile } from '../../../domain';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { aCaseField, createCaseField, createFieldType, createMultiSelectListFieldType } from '../../../fixture/shared.test.fixture';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { CcdCaseTitlePipe } from '../../../pipes/case-title/ccd-case-title.pipe';
import { CcdCYAPageLabelFilterPipe } from '../../../pipes/complex/ccd-cyapage-label-filter.pipe';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
import { CcdPageFieldsPipe } from '../../../pipes/complex/cdd-page-fields.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import {
  CaseFieldService,
  FieldsPurger,
  FieldsUtils,
  FormErrorService,
  FormValueService,
  OrderService,
  ProfileNotifier,
  SessionStorageService
} from '../../../services';
import { text } from '../../../test/helpers';
import { CallbackErrorsContext } from '../../error';
import { IsCompoundPipe } from '../../palette/utils/is-compound.pipe';
import { CaseEditPageText } from '../case-edit-page/case-edit-page-text.enum';
import { aWizardPage } from '../case-edit.spec';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage, WizardPageField } from '../domain';
import { CaseNotifier } from '../services';
import { CaseEditSubmitComponent } from './case-edit-submit.component';

import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;

xdescribe('CaseEditSubmitComponent', () => {

  let comp: CaseEditSubmitComponent;
  let fixture: ComponentFixture<CaseEditSubmitComponent>;
  let de: DebugElement;

  let mockRouter: any;
  mockRouter = {
    navigate: jasmine.createSpy('navigate')
  };

  let sessionStorageService: any;
  let mockCaseNotifier: any;
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
  const fieldsUtils = new FieldsUtils();
  const FORM_GROUP = new FormGroup({
    data: new FormGroup({PersonLastName: new FormControl('Khaleesi')})
  });
  const HIDE_ALL_TEXT_ELEMENT = new FormControl('Hide all');
  const COMPLEX_SUBFIELD_1_VALUE_RETAINED = '1st child field of complex type (retain)';
  const COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL = '1st child field of complex type (retain) - original';
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
  const FIELD_1_VALUE_RETAINED = 'Hidden value to be retained';
  const FIELD_1_VALUE_RETAINED_ORIGINAL = 'Original value to be retained';
  const FIELD_2_VALUE_NOT_RETAINED = 'Hidden value not to be retained';
  const MULTI_SELECT_FIELD_VALUE_1 = 'UK';
  const MULTI_SELECT_FIELD_VALUE_2 = 'US';
  const MULTI_SELECT_FIELD_VALUE_3 = 'IE';
  const DOCUMENT_BINARY_URL_VALUE = 'http://document_binary.url';
  const DOCUMENT_FILENAME_VALUE = 'document.dummy';
  const DOCUMENT_URL_VALUE = 'http://document.url';
  const DOCUMENT_FILENAME_ORIGINAL_VALUE = 'document.original';
  // Representative dummy UUID value
  const COLLECTION_ELEMENT_ID_ATTRIBUTE = '0a1b2c3d-a1b2-c3d4-e5f6-00aa11bb22cc';
  const FIELD_3_SHOW_CONDITION = 'field3!="Hide all"';

  /**
   * Helper function for creating a multi-select element that is hidden.
   *
   * @returns A `FormArray` with a `FormControl` for each multi-select option
   */
  const createMultiSelectElementHidden = (): FormArray => {
    const multiSelectElement = new FormArray([
      new FormControl({value: MULTI_SELECT_FIELD_VALUE_1, disabled: true}),
      new FormControl({value: MULTI_SELECT_FIELD_VALUE_2, disabled: true})
    ]);
    multiSelectElement.disable();
    return multiSelectElement;
  };

  /**
   * Helper function for creating a Document element that is hidden.
   *
   * @returns A `FormGroup` with a `FormControl` for each of the three fields that constitute a Document field
   */
  const createDocumentElementHidden = (): FormGroup => {
    const documentElement = new FormGroup({
      document_binary_url: new FormControl({value: DOCUMENT_BINARY_URL_VALUE, disabled: true}),
      document_filename: new FormControl({value: DOCUMENT_FILENAME_VALUE, disabled: true}),
      document_url: new FormControl({value: DOCUMENT_URL_VALUE, disabled: true})
    });
    documentElement.disable();
    return documentElement;
  };

  /**
   * Helper function for creating a `FormGroup` with hidden multi-select and Document fields.
   *
   * @returns A `FormGroup` with a "data" `FormGroup` comprising multi-select and Document fields, and the "Hide all"
   * text field
   */
  const createFormGroupWithHiddenMultiSelectAndDocumentFields = (): FormGroup => {
    return new FormGroup({
      data: new FormGroup({
        countrySelection: createMultiSelectElementHidden(),
        documentField: createDocumentElementHidden(),
        field3: HIDE_ALL_TEXT_ELEMENT
      })
    });
  };

  /**
   * Helper function for creating a Collection element that is hidden.
   *
   * @param id The unique identifier of the item in the Collection
   * @param value The `FormGroup` to use as the value of the item in the Collection
   * @returns A `FormArray` with a `FormGroup` containing an object, which represents a field value, comprising "id"
   * `FormControl` and "value" `FormGroup` attributes
   */
  const createCollectionElementHidden = (id: string, value: FormGroup): FormArray => {
    const collectionElement = new FormArray([
      new FormGroup({
        // Each field value in a collection is wrapped in an object comprising an "id" FormControl with a UUID, and a
        // "value" attribute, which is the field FormGroup itself
        id: new FormControl(id),
        value
      })
    ]);
    collectionElement.disable();
    return collectionElement;
  };

  /**
   * Helper function for creating a `FormGroup` with a Collection field.
   *
   * @param collection The `FormArray` to use for the Collection field
   * @returns A `FormGroup` with a "data" `FormGroup` comprising a Collection field with the specified `FormArray`, and
   * the "Hide all" text field
   */
  const createFormGroupWithCollectionField = (collection: FormArray): FormGroup => {
    return new FormGroup({
      data: new FormGroup({
        collectionField1: collection,
        field3: HIDE_ALL_TEXT_ELEMENT
      })
    });
  };

  /**
   * Helper function for creating a simple element, containing one field, which is hidden.
   *
   * @param value The string value to use for the field
   * @returns A `FormControl` for the simple field
   */
  const createSimpleElementHidden = (value: string): FormControl => {
    const simpleElement = new FormControl({value, disabled: true});
    return simpleElement;
  };

  /**
   * Helper function for creating a Complex element, containing two fields, which is hidden.
   *
   * @returns A `FormGroup` with a `FormControl` for each of the two fields that constitute the Complex field
   */
  const createComplexElementHidden = (): FormGroup => {
    const complexElement = new FormGroup({
      childField1: new FormControl(COMPLEX_SUBFIELD_1_VALUE_RETAINED),
      childField2: new FormControl(COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED)
    });
    complexElement.disable();
    return complexElement;
  };

  /**
   * Helper function for creating a `FormGroup` with hidden simple and Complex fields.
   *
   * @returns A `FormGroup` with a "data" `FormGroup` comprising two simple fields, a Complex field, and the "Hide all"
   * text field
   */
  const createFormGroupWithHiddenSimpleAndComplexFields = (): FormGroup => {
    return new FormGroup({
      data: new FormGroup({
        field1: createSimpleElementHidden(FIELD_1_VALUE_RETAINED),
        field2: createSimpleElementHidden(FIELD_2_VALUE_NOT_RETAINED),
        field3: HIDE_ALL_TEXT_ELEMENT,
        complexField1: createComplexElementHidden()
      })
    });
  };

  /**
   * Helper function for creating a nested Complex element that is hidden.
   *
   * @param complexField The `FormGroup` to nest
   * @returns A `FormGroup` containing the specified `FormGroup` as a Complex field of this one
   */
  const createNestedComplexElementHidden = (complexField: FormGroup): FormGroup => {
    const nestedComplexElement = new FormGroup({
      complexField1: complexField
    });
    nestedComplexElement.disable();
    return nestedComplexElement;
  };

  /**
   * Helper function for creating a `FormGroup` with a nested Complex field.
   *
   * @param nestedComplex The `FormGroup` to use for the nested Complex field
   * @returns A `FormGroup` with a "data" `FormGroup` comprising a nested Complex field with the specified `FormGroup`,
   * and the "Hide all" text field
   */
  const createFormGroupWithNestedComplexField = (nestedComplex: FormGroup): FormGroup => {
    return new FormGroup({
      data: new FormGroup({
        nestedComplexField1: nestedComplex,
        field3: HIDE_ALL_TEXT_ELEMENT
      })
    });
  };

  let caseEditComponent: any;
  let orderService: OrderService;
  let profileNotifier: ProfileNotifier;
  let profileNotifierSpy: jasmine.Spy;
  let casesReferencePipe: jasmine.SpyObj<CaseReferencePipe>;
  let populateFlagDetailsSpy: jasmine.Spy;
  let removeFlagLauncherFieldSpy: jasmine.Spy;
  const caseField1: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4);
  const caseField2: CaseField = aCaseField('field2', 'field2', 'Text', 'OPTIONAL', 3, null, false, true);
  const caseField3: CaseField = aCaseField('field3', 'field3', 'Text', 'OPTIONAL', 2);
  const complexSubField1: CaseField = aCaseField('childField1', 'childField1', 'Text', 'OPTIONAL', 1, null, true, true);
  const complexSubField2: CaseField = aCaseField('childField2', 'childField2', 'Text', 'OPTIONAL', 2, null, false, true);
  const complexCaseField: CaseField = aCaseField('complexField1', 'complexField1', 'Complex', 'OPTIONAL', 1,
    [complexSubField1, complexSubField2], true, true);
  const nestedComplexCaseField: CaseField = aCaseField('nestedComplexField1', 'nestedComplexField1', 'Complex',
    'OPTIONAL', 1, [complexCaseField], true, true);
  const caseFieldRetainHiddenValue: CaseField = aCaseField('field1', 'field1', 'Text', 'OPTIONAL', 4, null, true, true);
  const countries: FixedListItem[] = [{code: 'UK', label: 'United Kingdom'}, {code: 'US', label: 'United States'}];
  const countryMultiSelectFieldType: FieldType = createMultiSelectListFieldType('countryCodes', countries);
  const countryMultiSelectField: CaseField = createCaseField('countrySelection', 'Country selection', '',
    countryMultiSelectFieldType, 'OPTIONAL', 1, null, null, true);
  const documentField = aCaseField('documentField', 'Dummy document', 'Document', 'OPTIONAL', 2, null, false, true);
  const documentCollectionFieldType: FieldType = createFieldType('documentCollection', 'Collection', [],
    documentField.field_type);
  const documentCollectionField: CaseField = createCaseField('collectionField1', 'collectionField1', '',
    documentCollectionFieldType, 'OPTIONAL', 1, null, null, true);
  const complexCollectionFieldType: FieldType = createFieldType('complexCollection', 'Collection', [],
    complexCaseField.field_type);
  const complexCollectionField: CaseField = createCaseField('collectionField1', 'collectionField1', '',
    complexCollectionFieldType, 'OPTIONAL', 1, null, null, true);
  const nestedComplexCollectionFieldType: FieldType = createFieldType('nestedComplexCollection', 'Collection', [],
    nestedComplexCaseField.field_type);
  const nestedComplexCollectionField: CaseField = createCaseField('collectionField1', 'collectionField1', '',
    nestedComplexCollectionFieldType, 'OPTIONAL', 1, null, null, true);
  const flagLauncherCaseField: CaseField = aCaseField('flagLauncher1', 'flagLauncher1', 'FlagLauncher', 'OPTIONAL', 1);
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
  const ERROR_HEADING_SPECIFIC = 'The event could not be created';
  const ERROR_MESSAGE_SPECIFIC = 'There are field validation errors';
  const REVIEW_FLAG_DETAILS_PAGE_TITLE = 'Review flag details';

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

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
    });

    it('should show event notes when not defined in event trigger and showEventNotes is called', () => {
      comp.eventTrigger.show_event_notes = undefined;
      fixture.detectChanges();
      const eventNotes = de.query($EVENT_NOTES);

      const result = comp.showEventNotes();

      expect(result).toBeTruthy();
      expect(eventNotes).not.toBeNull();
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
      comp.isSubmitting = true;
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
      comp.isSubmitting = false;
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      orderService = new OrderService();
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
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CcdPageFieldsPipe,
          FieldsFilterPipe,
          ReadFieldsFilterPipe,
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

    it('should display specific error heading and message when callback errors, callback warnings and details are set to null', () => {
      comp.error = {
        status: 422,
        callbackErrors: null,
        callbackWarnings: null,
        details: null,
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

  describe('Form submit test for simple and Complex field types', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: caseFieldRetainHiddenValue.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField2.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
    const WP_FIELD_4: WizardPageField = {case_field_id: complexCaseField.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      caseFieldRetainHiddenValue.show_condition = FIELD_3_SHOW_CONDITION;
      caseFieldRetainHiddenValue.value = FIELD_1_VALUE_RETAINED;
      caseFieldRetainHiddenValue.formatted_value = FIELD_1_VALUE_RETAINED;
      caseField2.show_condition = FIELD_3_SHOW_CONDITION;
      caseField2.value = FIELD_2_VALUE_NOT_RETAINED;
      complexCaseField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexCaseField.formatted_value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenSimpleAndComplexFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [caseFieldRetainHiddenValue, caseField2, caseField3, complexCaseField],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with null for any hidden fields (including sub-fields of Complex types) whose non-empty values are NOT to be retained', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field1: FIELD_1_VALUE_RETAINED,
          field2: null,
          field3: 'Hide all',
          complexField1: {
            childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
            childField2: null
          }
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for MultiSelectList and Document field types, both retain_hidden_value = false', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: countryMultiSelectField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: documentField.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      countryMultiSelectField.show_condition = FIELD_3_SHOW_CONDITION;
      countryMultiSelectField.value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2];
      documentField.show_condition = FIELD_3_SHOW_CONDITION;
      documentField.value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenMultiSelectAndDocumentFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [countryMultiSelectField, documentField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the multi-select list field and null for the entire Document field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          documentField: null,
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for MultiSelectList and Document field types, both retain_hidden_value = true', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: countryMultiSelectField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: documentField.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      countryMultiSelectField.retain_hidden_value = true;
      countryMultiSelectField.show_condition = FIELD_3_SHOW_CONDITION;
      countryMultiSelectField.value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2];
      countryMultiSelectField.formatted_value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2];
      documentField.retain_hidden_value = true;
      documentField.show_condition = FIELD_3_SHOW_CONDITION;
      documentField.value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      documentField.formatted_value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenMultiSelectAndDocumentFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [countryMultiSelectField, documentField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with both the multi-select list field and Document field, maintaining existing values', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          countrySelection: [ MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2 ],
          documentField: {
            document_binary_url: DOCUMENT_BINARY_URL_VALUE,
            document_filename: DOCUMENT_FILENAME_VALUE,
            document_url: DOCUMENT_URL_VALUE
          },
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for MultiSelectList and Document field types, both retain_hidden_value = false', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: countryMultiSelectField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: documentField.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      countryMultiSelectField.retain_hidden_value = false;
      countryMultiSelectField.show_condition = FIELD_3_SHOW_CONDITION;
      countryMultiSelectField.value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2];
      documentField.retain_hidden_value = false;
      documentField.show_condition = FIELD_3_SHOW_CONDITION;
      documentField.value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenMultiSelectAndDocumentFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [countryMultiSelectField, documentField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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
          {provide: CaseNotifier, useValue: mockCaseNotifier}
        ]
      }).compileComponents();
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should submit CaseEventData with an empty array for the multi-select list field and null for the Document field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          documentField: null,
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection field type, with retain_hidden_value = true and a non-empty Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: complexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [complexCollectionField, caseField3];
    const wizard: Wizard = new Wizard(pages);
    const queryParamMapNoProfile = createSpyObj('queryParamMap', ['get']);
    let casesService: any;
    casesService = createSpyObj('casesService', ['getCaseViewV2']);
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };
    const CASE_CACHED: CaseView = new CaseView();
    CASE_CACHED.case_id = 'CACHED_CASE_ID_1';
    mockCaseNotifier = new CaseNotifier(casesService);
    mockCaseNotifier.cachedCaseView = CASE_CACHED;

    beforeEach(() => {
      complexCollectionField.retain_hidden_value = true;
      complexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      }];
      complexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      }];
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createComplexElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [complexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => { mockCaseNotifier.cachedCaseView = null; }
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an array containing the Complex field, with *original* values for all sub-fields', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
              childField2: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });

    it('should submit CaseEventData and makes the cachedCaseView property of CaseNotifier to null', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();
      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
              childField2: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
      expect(mockCaseNotifier.cachedCaseView).toBe(null);
    });

    it('should check for callback error context', () => {
      const callbackErrorsContext = new CallbackErrorsContext();
      callbackErrorsContext.ignore_warning = true;
      callbackErrorsContext.trigger_text = 'test';
      comp.callbackErrorsNotify(callbackErrorsContext);
      expect(comp.ignoreWarning).toBe(true);
      expect(comp.triggerText).toBe('test');
    });

    it('should check for isLabel', () => {
      const caseField: CaseField = aCaseField('field1', 'field1', 'Label', 'OPTIONAL', 4);
      comp.isLabel(caseField);
      expect(comp.isLabel(caseField)).toBe(true);
    });
  });

  describe('Form submit test for Complex collection field type, with retain_hidden_value = true and an empty Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: complexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [complexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      complexCollectionField.retain_hidden_value = true;
      complexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
        }
      }];
      complexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
        }
      }];
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_EMPTY;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY)),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [complexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection field type, with retain_hidden_value = false and a non-empty Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: complexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [complexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      complexCollectionField.retain_hidden_value = false;
      complexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      }];
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_NOT_RETAINED)),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [complexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CcdCYAPageLabelFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for nested Complex field type, retain_hidden_value = true', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCaseField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCaseField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCaseField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCaseField.value = {
        [complexCaseField.id]: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithNestedComplexField(createNestedComplexElementHidden(createComplexElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCaseField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          CcdCYAPageLabelFilterPipe,
          ReadFieldsFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with null for any hidden fields of the nested Complex type whose non-empty values are NOT to be retained', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();

      fixture.detectChanges();

      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          nestedComplexField1: {
            complexField1: {
              childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
              childField2: null
            }
          },
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for nested Complex field type, retain_hidden_value = false, descendant fields with retain_hidden_value = true',
  () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCaseField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCaseField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCaseField.retain_hidden_value = false;
      nestedComplexCaseField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCaseField.value = {
        [complexCaseField.id]: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithNestedComplexField(createNestedComplexElementHidden(createComplexElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCaseField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with null for the nested Complex field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          nestedComplexField1: null,
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection field type, retain_hidden_value = true, non-empty nested Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCollectionField.retain_hidden_value = true;
      nestedComplexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
            [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
          }
        }
      }];
      nestedComplexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
            [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
          }
        }
      }];
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(
            COLLECTION_ELEMENT_ID_ATTRIBUTE, createNestedComplexElementHidden(createComplexElementHidden()))),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an array containing the nested Complex field, with *original* values for all sub-fields', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              complexField1: {
                childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
                childField2: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
              }
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection field type, retain_hidden_value = true, empty nested Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCollectionField.retain_hidden_value = true;
      nestedComplexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
          }
        }
      }];
      nestedComplexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
          }
        }
      }];
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_EMPTY;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(
            COLLECTION_ELEMENT_ID_ATTRIBUTE, createNestedComplexElementHidden(COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY))),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the nested Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection field type, retain_hidden_value = false, non-empty nested Complex field', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCollectionField.retain_hidden_value = false;
      nestedComplexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
          }
        }
      }];
      complexCaseField.value = {
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(
            COLLECTION_ELEMENT_ID_ATTRIBUTE, createNestedComplexElementHidden(COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_NOT_RETAINED))),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the nested Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Document collection field type, with retain_hidden_value = true', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: documentCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [documentCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      documentCollectionField.retain_hidden_value = true;
      documentCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      documentCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      documentCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createDocumentElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [documentCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with the Document collection field, maintaining existing values', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              document_binary_url: DOCUMENT_BINARY_URL_VALUE,
              document_filename: DOCUMENT_FILENAME_VALUE,
              document_url: DOCUMENT_URL_VALUE
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Document collection field type, with retain_hidden_value = false', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: documentCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [documentCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      documentCollectionField.retain_hidden_value = false;
      documentCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      documentCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createDocumentElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [documentCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an empty array for the Document collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for simple and Complex field types, discarding user input where retain_hidden_value = true', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: caseFieldRetainHiddenValue.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField2.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
    const WP_FIELD_4: WizardPageField = {case_field_id: complexCaseField.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      caseFieldRetainHiddenValue.show_condition = FIELD_3_SHOW_CONDITION;
      caseFieldRetainHiddenValue.value = FIELD_1_VALUE_RETAINED;
      caseFieldRetainHiddenValue.formatted_value = FIELD_1_VALUE_RETAINED_ORIGINAL;
      caseField2.show_condition = FIELD_3_SHOW_CONDITION;
      caseField2.value = FIELD_2_VALUE_NOT_RETAINED;
      complexCaseField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexCaseField.formatted_value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenSimpleAndComplexFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [caseFieldRetainHiddenValue, caseField2, caseField3, complexCaseField],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with null for any hidden fields (including sub-fields of Complex types) whose non-empty values are NOT to be retained', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          field1: FIELD_1_VALUE_RETAINED_ORIGINAL,
          field2: null,
          field3: 'Hide all',
          complexField1: {
            childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
            childField2: null
          }
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for MultiSelectList and Document field types, both retain_hidden_value = true, discarding user input', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: countryMultiSelectField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: documentField.id};
    const WP_FIELD_3: WizardPageField = {case_field_id: caseField3.id};
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
              isSolicitor: () => false,
            }
          }
        }
      ],
      queryParamMap: queryParamMapNoProfile,
    };
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      countryMultiSelectField.retain_hidden_value = true;
      countryMultiSelectField.show_condition = FIELD_3_SHOW_CONDITION;
      countryMultiSelectField.value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_2];
      countryMultiSelectField.formatted_value = [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_3];
      documentField.retain_hidden_value = true;
      documentField.show_condition = FIELD_3_SHOW_CONDITION;
      documentField.value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      documentField.formatted_value = {
        document_binary_url: DOCUMENT_BINARY_URL_VALUE,
        document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
        document_url: DOCUMENT_URL_VALUE
      };
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithHiddenMultiSelectAndDocumentFields(),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [countryMultiSelectField, documentField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with both the multi-select list field and Document field, using *original* values', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          countrySelection: [MULTI_SELECT_FIELD_VALUE_1, MULTI_SELECT_FIELD_VALUE_3],
          documentField: {
            document_binary_url: DOCUMENT_BINARY_URL_VALUE,
            document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
            document_url: DOCUMENT_URL_VALUE
          },
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection, retain_hidden_value = true, non-empty Complex field, user input discarded', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: complexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [complexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      complexCollectionField.retain_hidden_value = true;
      complexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      }];
      complexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
          [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
        }
      }];
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createComplexElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [complexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an array containing the Complex field, with *original* values for all sub-fields', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
              childField2: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection, with retain_hidden_value = true, empty Complex field, user input discarded', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: complexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [complexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      complexCollectionField.retain_hidden_value = true;
      complexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      complexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
        }
      }];
      complexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL
        }
      }];
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_EMPTY;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY)),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [complexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with the *original* array for the Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection, retain_hidden_value = true, non-empty nested Complex, user input discarded', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCollectionField.retain_hidden_value = true;
      nestedComplexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
            [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
          }
        }
      }];
      nestedComplexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
            [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
          }
        }
      }];
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED,
        [complexSubField2.id]: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_RETAINED;
      complexSubField2.value = COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(
            COLLECTION_ELEMENT_ID_ATTRIBUTE, createNestedComplexElementHidden(createComplexElementHidden()))),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with an array containing the nested Complex field, with *original* values for all sub-fields', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              complexField1: {
                childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL,
                childField2: COMPLEX_SUBFIELD_2_VALUE_NOT_RETAINED
              }
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Complex collection, retain_hidden_value = true, empty nested Complex field, user input discarded', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: nestedComplexCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [nestedComplexCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      nestedComplexCollectionField.retain_hidden_value = true;
      nestedComplexCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      nestedComplexCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
          }
        }
      }];
      nestedComplexCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          [complexCaseField.id]: {
            [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL
          }
        }
      }];
      complexCaseField.value = {
        [complexSubField1.id]: COMPLEX_SUBFIELD_1_VALUE_EMPTY
      };
      complexSubField1.value = COMPLEX_SUBFIELD_1_VALUE_EMPTY;
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(
            COLLECTION_ELEMENT_ID_ATTRIBUTE, createNestedComplexElementHidden(COMPLEX_ELEMENT_HIDDEN_SINGLE_FIELD_EMPTY))),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [nestedComplexCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with the *original* array for the nested Complex collection field', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              complexField1: {
                childField1: COMPLEX_SUBFIELD_1_VALUE_RETAINED_ORIGINAL
              }
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test for Document collection field type, with retain_hidden_value = true, user input discarded', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: documentCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [documentCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      documentCollectionField.retain_hidden_value = true;
      documentCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      documentCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      documentCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createDocumentElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [documentCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with the Document collection field, using *original* values', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();

      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              document_binary_url: DOCUMENT_BINARY_URL_VALUE,
              document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
              document_url: DOCUMENT_URL_VALUE
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Form submit test with event completion checks', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: documentCollectionField.id};
    const WP_FIELD_2: WizardPageField = {case_field_id: caseField3.id};
    firstPage.wizard_page_fields = [WP_FIELD_1, WP_FIELD_2];
    firstPage.case_fields = [documentCollectionField, caseField3];
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
    const PROFILE_OBS: Observable<Profile> = of(PROFILE);
    const mockRouteNoProfile = {
      params: of({id: 123}),
      snapshot: snapshotNoProfile
    };

    beforeEach(() => {
      documentCollectionField.retain_hidden_value = true;
      documentCollectionField.show_condition = FIELD_3_SHOW_CONDITION;
      documentCollectionField.value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      documentCollectionField.formatted_value = [{
        id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
        value: {
          document_binary_url: DOCUMENT_BINARY_URL_VALUE,
          document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
          document_url: DOCUMENT_URL_VALUE
        }
      }];
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj('cancelled', ['emit']);
      caseEditComponent = {
        form: createFormGroupWithCollectionField(
          createCollectionElementHidden(COLLECTION_ELEMENT_ID_ATTRIBUTE, createDocumentElementHidden())),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        event: {
          id: 'sendDirection'
        },
        eventTrigger: {
          case_fields: [documentCollectionField, caseField3],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        caseDetails: {case_id: '1234567812345678', tabs: [], metadataFields: [], state: {id: 'incompleteApplication', name: 'Incomplete Application', title_display: '# 12345678123456: west'}},
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'removeItem']);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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

    it('should submit CaseEventData with task in session and even completion checks', () => {
      sessionStorageService.getItem.and.returnValue(task);
      spyOn(comp, 'getEventId').and.returnValue('09470b68-3bd0-11ec-9740-b6b84d919277');
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();
      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();

      expect(sessionStorageService.getItem).toHaveBeenCalled();
      expect(comp.getEventId).toHaveBeenCalled();
      expect(comp.eventCompletionChecksRequired).toEqual(true);
    });

    it('should submit CaseEventData with task not in session and even completion checks not required', () => {
      sessionStorageService.getItem.and.returnValue(null);
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();
      // Submit the form and check the expected CaseEventData is being passed to the CaseEditComponent for submission
      comp.submit();

      expect(sessionStorageService.getItem).toHaveBeenCalled();
      expect(comp.eventCompletionChecksRequired).toEqual(false);
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              document_binary_url: DOCUMENT_BINARY_URL_VALUE,
              document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
              document_url: DOCUMENT_URL_VALUE
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });

    it('should submit CaseEventData when event emitter handler is called with true', () => {
      // Trigger the clearing of hidden fields by invoking next()
      caseEditComponent.next();
      comp.onEventCanBeCompleted(true);
      expect(caseEditComponent.submit).toHaveBeenCalledWith({
        data: {
          // Note that Collection fields are restored *in their entirety* when any user input is discarded, as per
          // agreed handling of Scenarios 5 and 8 in EUI-3868
          collectionField1: [{
            id: COLLECTION_ELEMENT_ID_ATTRIBUTE,
            value: {
              document_binary_url: DOCUMENT_BINARY_URL_VALUE,
              document_filename: DOCUMENT_FILENAME_ORIGINAL_VALUE,
              document_url: DOCUMENT_URL_VALUE
            }
          }],
          field3: 'Hide all'
        },
        event: undefined,
        event_token: undefined,
        ignore_warning: false
      });
    });
  });

  describe('Tests for Case Flag submission', () => {
    const pages: WizardPage[] = [
      aWizardPage('page1', 'Page 1', 1),
    ];
    const firstPage = pages[0];
    const WP_FIELD_1: WizardPageField = {case_field_id: flagLauncherCaseField.id};
    firstPage.wizard_page_fields = [WP_FIELD_1];
    firstPage.case_fields = [flagLauncherCaseField];
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

    beforeEach(waitForAsync(() => {
      orderService = new OrderService();
      casesReferencePipe = createSpyObj<CaseReferencePipe>('caseReference', ['transform']);
      cancelled = createSpyObj(cancelled, ['emit'])
      caseEditComponent = {
        form: new FormGroup({
          data: new FormGroup({
            [flagLauncherCaseField.id]: createSimpleElementHidden(null)
          })
        }),
        fieldsPurger: new FieldsPurger(fieldsUtils),
        data: '',
        eventTrigger: {
          case_fields: [flagLauncherCaseField],
          can_save_draft: true
        },
        wizard,
        hasPrevious: () => true,
        getPage: () => firstPage,
        navigateToPage: () => undefined,
        next: () => new FieldsPurger(fieldsUtils).clearHiddenFields(
          caseEditComponent.form, caseEditComponent.wizard, caseEditComponent.eventTrigger, firstPage.id),
        cancel: () => undefined,
        cancelled,
        submit: createSpy('submit').and.returnValue({
          // Provide a dummy subscribe function to be called in place of the real one
          subscribe: () => {}
        })
      };
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);
      const formValueServiceReal = new FormValueService(null);
      populateFlagDetailsSpy = spyOn(formValueServiceReal, 'populateFlagDetailsFromCaseFields').and.callThrough();
      removeFlagLauncherFieldSpy = spyOn(formValueServiceReal, 'removeFlagLauncherField').and.callThrough();

      profileNotifier = new ProfileNotifier();
      profileNotifier.profile = new BehaviorSubject(createAProfile()).asObservable();
      profileNotifierSpy = spyOn(profileNotifier, 'announceProfile').and.callThrough();

      sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
      sessionStorageService.getItem.and.returnValue(null);

      TestBed.configureTestingModule({
        declarations: [
          CaseEditSubmitComponent,
          IsCompoundPipe,
          ReadFieldsFilterPipe,
          CcdCYAPageLabelFilterPipe,
          CcdPageFieldsPipe,
          CaseReferencePipe,
          CcdCaseTitlePipe
        ],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: CaseEditComponent, useValue: caseEditComponent},
          {provide: FormValueService, useValue: formValueServiceReal},
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
          {provide: CaseNotifier, useValue: mockCaseNotifier}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditSubmitComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should set the page title correctly', () => {
      expect(comp.pageTitle).toEqual(REVIEW_FLAG_DETAILS_PAGE_TITLE);
    });

    it('should populate flag details data for each Flags field and remove the FlagLauncher field prior to submission', () => {
      // Submit the form and check calls are made to the correct functions in FormValueService
      comp.submit();
      expect(populateFlagDetailsSpy).toHaveBeenCalled();
      expect(removeFlagLauncherFieldSpy).toHaveBeenCalled();
    });
  });
});
