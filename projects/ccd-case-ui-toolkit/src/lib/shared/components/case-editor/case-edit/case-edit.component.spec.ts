import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of, throwError } from 'rxjs';
import { ConditionalShowRegistrarService } from '../../../directives';
import { CaseView, FieldType, HttpError, Profile } from '../../../domain';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { createCaseEventTrigger } from '../../../fixture/shared.test.fixture';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FieldsPurger, FieldsUtils, LoadingService, SessionStorageService, WindowService } from '../../../services';
import { FormErrorService, FormValueService } from '../../../services/form';
import { PaletteUtilsModule } from '../../palette';
import { Confirmation, Wizard, WizardPage, WizardPageField } from '../domain';
import { CaseNotifier } from '../services';
import { WizardFactoryService } from '../services/wizard-factory.service';
import { CaseEditComponent } from './case-edit.component';
import createSpyObj = jasmine.createSpyObj;

// this suite is breaking the test runner, needs addressing
xdescribe('CaseEditComponent', () => {
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(
    'TEST_TRIGGER',
    'Test Trigger',
    'caseId',
    false,
    [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        field_type: null,
        display_context: 'READONLY'
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        field_type: null,
        display_context: 'OPTIONAL'
      }) as CaseField
    ]
  );

  const CASE_FIELD_WITH_SHOW_CONDITION: CaseField = ({
    id: 'PersonFirstName',
    label: 'First name',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    display_context: 'READONLY',
    show_condition: 'PersonLastName=\"Smith\"'
  }) as CaseField;

  const CASE_FIELD_1: CaseField = ({
    id: 'PersonFirstName',
    label: 'First name',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    display_context: 'READONLY'
  }) as CaseField;

  const CASE_FIELD_2: CaseField = ({
    id: 'PersonLastName',
    label: 'Last name',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    display_context: 'READONLY'
  }) as CaseField;

  const PERSON_NAME_FIELD_TYPE: FieldType = {
    id: 'PersonName',
    type: 'Complex',
    complex_fields: [
      {
        id: 'PersonMiddleName',
        label: 'Middle name',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        display_context: 'READONLY'
      } as CaseField
    ]
  };

  const CASE_FIELD_2_COMPLEX: CaseField = ({
    id: 'PersonLastName',
    label: 'Last name',
    field_type: PERSON_NAME_FIELD_TYPE,
    display_context: 'READONLY'
  }) as CaseField;

  const CASE_FIELD_2_COLLECTION: CaseField = ({
    id: 'PersonLastNameCollection',
    label: 'Last name (collection)',
    field_type: {
      id: 'LastNameCollection',
      type: 'Collection',
      collection_field_type: PERSON_NAME_FIELD_TYPE
    },
    display_context: 'READONLY'
  }) as CaseField;

  const CASE_FIELD_3: CaseField = ({
    id: 'Address',
    label: 'Address',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    display_context: 'READONLY'
  }) as CaseField;

  const ADDRESS_DETAILS_FIELD_TYPE: FieldType = {
    id: 'AddressDetails',
    type: 'Complex',
    complex_fields: [
      {
        id: 'AddressLine1',
        label: 'Address line 1',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        display_context: 'READONLY'
      } as CaseField
    ]
  };

  const CASE_FIELD_3_COMPLEX: CaseField = ({
    id: 'Address',
    label: 'Address',
    field_type: ADDRESS_DETAILS_FIELD_TYPE,
    display_context: 'READONLY'
  }) as CaseField;

  const CASE_FIELD_3_COLLECTION: CaseField = ({
    id: 'AddressCollection',
    label: 'Address (collection)',
    field_type: {
      id: 'AddressDetailsCollection',
      type: 'Collection',
      collection_field_type: ADDRESS_DETAILS_FIELD_TYPE
    },
    display_context: 'READONLY'
  }) as CaseField;

  const WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION: WizardPageField = {
    case_field_id: CASE_FIELD_WITH_SHOW_CONDITION.id
  };

  const WIZARD_PAGE_1: WizardPageField = {
    case_field_id: CASE_FIELD_1.id
  };

  const WIZARD_PAGE_2: WizardPageField = {
    case_field_id: CASE_FIELD_2.id
  };

  const WIZARD_PAGE_2_COLLECTION: WizardPageField = {
    case_field_id: CASE_FIELD_2_COLLECTION.id
  };

  const WIZARD_PAGE_3: WizardPageField = {
    case_field_id: CASE_FIELD_3.id
  };

  const WIZARD_PAGE_3_COLLECTION: WizardPageField = {
    case_field_id: CASE_FIELD_3_COLLECTION.id
  };

  let fixture: ComponentFixture<CaseEditComponent>;
  let component: CaseEditComponent;
  let de: DebugElement;

  const eventTriggerHeaderComponentMock: any = MockComponent({
    selector: 'ccd-event-trigger-header',
    inputs: ['eventTrigger']
  });

  const fieldReadComponentMock: any = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField']
  });

  const fieldWriteComponentMock: any = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'formGroup', 'idPrefix', 'isExpanded', 'parent']
  });

  const routerLinkComponentMock: any = MockComponent({
    selector: 'a',
    inputs: ['routerLink']
  });

  let cancelHandler: any;
  let submitHandler: any;
  let formErrorService: jasmine.SpyObj<FormErrorService>;
  let formValueService: jasmine.SpyObj<FormValueService>;
  let callbackErrorsSubject: any;
  let wizard: jasmine.SpyObj<Wizard>;
  let routerStub: any;
  const fieldsUtils = new FieldsUtils();
  const fieldsPurger = new FieldsPurger(fieldsUtils);
  const registrarService = new ConditionalShowRegistrarService();
  let route: any;
  let mockSessionStorageService: jasmine.SpyObj<SessionStorageService>;

  describe('profile available in route', () => {
    routerStub = {
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl'),
      routerState: {}
    };

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
      isCourtAdmin: FUNC
    };
    let loadingServiceMock: jasmine.SpyObj<LoadingService>;

    beforeEach(waitForAsync(() => {
      cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
      cancelHandler.applyFilters.and.returnValue();

      submitHandler = createSpyObj('submitHandler', ['applyFilters']);
      submitHandler.applyFilters.and.returnValue();

      callbackErrorsSubject = createSpyObj('callbackErrorsSubject', ['next']);
      wizard = createSpyObj<Wizard>('wizard', ['getPage', 'firstPage', 'nextPage', 'previousPage', 'hasPreviousPage']);
      wizard.pages = [];
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);

      formValueService = createSpyObj<FormValueService>('formValueService', [
        'sanitise',
        'clearNonCaseFields',
        'removeNullLabels',
        'removeEmptyDocuments',
        'populateFlagDetailsFromCaseFields',
        'removeFlagLauncherField',
        'removeComponentLauncherField',
        'removeEmptyCollectionsWithMinValidation',
        'populateLinkedCasesDetailsFromCaseFields'
      ]);
      mockSessionStorageService = createSpyObj<SessionStorageService>('SessionStorageService', ['getItem', 'removeItem', 'setItem']);

      route = {
        queryParams: of({Origin: 'viewDraft'}),
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

      loadingServiceMock = createSpyObj<LoadingService>('loadingService', ['register', 'unregister']);

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            PaletteUtilsModule,
            RouterTestingModule
          ],
          declarations: [
            CaseEditComponent,

            // Mocks
            eventTriggerHeaderComponentMock,
            routerLinkComponentMock,
            FieldsFilterPipe,
            fieldReadComponentMock,
            fieldWriteComponentMock
          ],
          providers: [
            WizardFactoryService,
            {provide: CaseNotifier, useValue: { cachedCaseView: null}},
            {provide: FormErrorService, useValue: formErrorService},
            {provide: FormValueService, useValue: formValueService},
            {provide: FieldsUtils, useValue: fieldsUtils},
            {provide: FieldsPurger, useValue: fieldsPurger},
            {provide: ConditionalShowRegistrarService, useValue: registrarService},
            {provide: Router, useValue: routerStub},
            {provide: ActivatedRoute, useValue: route},
            SessionStorageService,
            WindowService,
            { provide: LoadingService, loadingServiceMock }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseEditComponent);
      component = fixture.componentInstance;
      component.wizard = wizard;
      component.eventTrigger = EVENT_TRIGGER;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
    }));
    // Moved this test case to case-edit-page.component

    it('should return true for hasPrevious', () => {
      component.wizard = wizard;
      wizard.hasPreviousPage.and.returnValue(true);
      fixture.detectChanges();
      expect(component.hasPrevious('last')).toBeTruthy();
      expect(wizard.hasPreviousPage).toHaveBeenCalled();
    });

    it('should navigate to first page when first is called', () => {
      component.wizard = wizard;
      wizard.firstPage.and.returnValue(new WizardPage());
      fixture.detectChanges();
      component.first();
      expect(wizard.firstPage).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalled();
    });

    describe('fieldShowCondition', () => {
      describe('next page', () => {
        it('should navigate to next page when next is called and do not clear READONLY hidden field value', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.nextPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id).value).toBe('John');
          expect(component.form.get('data').get(CASE_FIELD_2.id).value).toBe('Smith');
        });

        it('should navigate to next page when next is called and do not clear visible field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.nextPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id).value).toBe('John');
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to next page when next is called and not clear hidden simple form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.nextPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to next page when next is called and not clear hidden complex form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.nextPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormGroup({PersonMiddleName: new FormControl('John')}),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to next page when next is called and not clear hidden collection form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.nextPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormArray([new FormGroup({PersonMiddleName: new FormControl('John')})]),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });
      });

      describe('previous page', () => {
        it('should navigate to previous page when previous is called and do not clear READONLY hidden field value', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.previousPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id).value).toBe('John');
          expect(component.form.get('data').get(CASE_FIELD_2.id).value).toBe('Smith');
        });

        it('should navigate to previous page when previous is called and do not clear visible field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.previousPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id).value).toBe('John');
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to previous page when previous is called and not clear hidden simple form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.previousPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to previous page when previous is called and not clear hidden complex form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.previousPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormGroup({PersonMiddleName: new FormControl('John')}),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });

        it('should navigate to previous page when previous is called and not clear hidden collection form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_FIELD_WITH_SHOW_CONDITION];
          currentPage.case_fields = [CASE_FIELD_WITH_SHOW_CONDITION, CASE_FIELD_2];
          wizard.getPage.and.returnValue(currentPage);
          wizard.previousPage.and.returnValue(new WizardPage());
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormArray([new FormGroup({PersonMiddleName: new FormControl('John')})]),
              PersonLastName: new FormControl('Other')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
        });
      });
    });

    describe('pageShowCondition', () => {
      describe('next page', () => {
        it('should navigate to next page when next is called and do not clear visible field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          nextPage.case_fields = [CASE_FIELD_2, CASE_FIELD_3];
          nextPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.pages = [currentPage, nextPage];
          wizard.nextPage.and.returnValue(nextPage);
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith'),
              Address: new FormControl('Some street')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3.id)).not.toBeNull();
        });

        it('should navigate to next page when next is called and retain hidden simple form fields with retain_hidden_value = true', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_3.retain_hidden_value = true;
          nextPage.case_fields = [CASE_FIELD_2, CASE_FIELD_3];
          nextPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.nextPage.and.returnValue(nextPage);
          wizard.pages = [currentPage, nextPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastName: new FormControl('Smith'),
              Address: new FormControl('Some street')
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id).value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3.id).value).not.toBeNull();
        });

        it('should navigate to next page when next is called and clear hidden complex form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COMPLEX.retain_hidden_value = true;
          CASE_FIELD_3_COMPLEX.retain_hidden_value = false;
          nextPage.case_fields = [CASE_FIELD_2_COMPLEX, CASE_FIELD_3_COMPLEX];
          nextPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.nextPage.and.returnValue(nextPage);
          wizard.pages = [currentPage, nextPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastName: new FormGroup({PersonMiddleName: new FormControl('John')}),
              Address: new FormGroup({AddressLine1: new FormControl('Street')})
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2_COMPLEX.id)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_2_COMPLEX.id}.PersonMiddleName`)).not.toBeNull();
          // 'PersonMiddleName' value expected to be null because this sub-field does not have
          // retain_hidden_value = true, even though its parent Complex field does
          expect(component.form.get('data').get(`${CASE_FIELD_2_COMPLEX.id}.PersonMiddleName`).value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3_COMPLEX.id)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_3_COMPLEX.id}.AddressLine1`)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_3_COMPLEX.id}.AddressLine1`).value).toBeNull();
        });

        it('should navigate to next page when next is called and clear hidden collection form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COLLECTION.retain_hidden_value = true;
          CASE_FIELD_3_COLLECTION.retain_hidden_value = false;
          nextPage.case_fields = [CASE_FIELD_2_COLLECTION, CASE_FIELD_3_COLLECTION];
          nextPage.wizard_page_fields = [WIZARD_PAGE_2_COLLECTION, WIZARD_PAGE_3_COLLECTION];
          wizard.nextPage.and.returnValue(nextPage);
          wizard.pages = [currentPage, nextPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastNameCollection: new FormArray([new FormGroup({
                value: new FormGroup({PersonMiddleName: new FormControl('John')})
              })]),
              AddressCollection: new FormArray([new FormGroup({
                value: new FormGroup({AddressLine1: new FormControl('Street')})
              })])
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2_COLLECTION.id)).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_2_COLLECTION.id) as FormArray).at(0)
            .get('value.PersonMiddleName')).not.toBeNull();
          // 'PersonMiddleName' value expected to be null because this sub-field does not have
          // retain_hidden_value = true, even though its top-level collection field does
          expect((component.form.get('data').get(CASE_FIELD_2_COLLECTION.id) as FormArray).at(0)
            .get('value.PersonMiddleName').value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3_COLLECTION.id)).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_3_COLLECTION.id) as FormArray).at(0)
            .get('value.AddressLine1')).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_3_COLLECTION.id) as FormArray).at(0)
            .get('value.AddressLine1').value).toBeNull();
        });

        it('should not delete sub-field value if the FormGroup for the parent Complex hidden field cannot be determined', () => {
          spyOn(fieldsPurger, 'deleteFieldValue');
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COMPLEX.retain_hidden_value = true;
          nextPage.case_fields = [CASE_FIELD_2_COMPLEX];
          nextPage.wizard_page_fields = [WIZARD_PAGE_2];
          wizard.nextPage.and.returnValue(nextPage);
          wizard.pages = [currentPage, nextPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonFamilyName: new FormGroup({PersonMiddleName: new FormControl('John')})
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(fieldsPurger.deleteFieldValue).not.toHaveBeenCalled();
        });

        it('should not delete sub-field values if the FormArray for Complex hidden field parents collection cannot be determined', () => {
          spyOn(fieldsPurger, 'deleteFieldValue');
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const nextPage = new WizardPage();
          nextPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_3_COLLECTION.retain_hidden_value = true;
          nextPage.case_fields = [CASE_FIELD_3_COLLECTION];
          nextPage.wizard_page_fields = [WIZARD_PAGE_3_COLLECTION];
          wizard.nextPage.and.returnValue(nextPage);
          wizard.pages = [currentPage, nextPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              AddressList: new FormArray([new FormGroup({
                value: new FormGroup({AddressLine1: new FormControl('Street')})
              })])
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(fieldsPurger.deleteFieldValue).not.toHaveBeenCalled();
        });

        it('should check page is not refreshed', () => {
          mockSessionStorageService.getItem.and.returnValue(component.initialUrl = null);
          mockSessionStorageService.getItem.and.returnValue(component.isPageRefreshed = false);

          fixture.detectChanges();
          expect(component.checkPageRefresh()).toBe(false);
        });

        it('should check page is refreshed', () => {
          mockSessionStorageService.getItem.and.returnValue(component.initialUrl = 'test');
          mockSessionStorageService.getItem.and.returnValue(component.isPageRefreshed = true);

          fixture.detectChanges();
          expect(component.checkPageRefresh()).toBe(true);
        });
      });

      describe('previous page', () => {
        it('should navigate to previous page when previous is called and do not clear visible field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          previousPage.case_fields = [CASE_FIELD_2, CASE_FIELD_3];
          previousPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.pages = [previousPage, currentPage];
          wizard.previousPage.and.returnValue(previousPage);
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('John'),
              PersonLastName: new FormControl('Smith'),
              Address: new FormControl('Some street')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3.id)).not.toBeNull();
        });

        it('should navigate to previous page when previous is called and retain hidden simple form fields with retain_hidden_value = true', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_3.retain_hidden_value = true;
          previousPage.case_fields = [CASE_FIELD_2, CASE_FIELD_3];
          previousPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.previousPage.and.returnValue(previousPage);
          wizard.pages = [previousPage, currentPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastName: new FormControl('Smith'),
              Address: new FormControl('Some street')
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2.id).value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3.id).value).not.toBeNull();
        });

        it('should navigate to previous page when previous is called and clear hidden complex form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COMPLEX.retain_hidden_value = true;
          CASE_FIELD_3_COMPLEX.retain_hidden_value = false;
          previousPage.case_fields = [CASE_FIELD_2_COMPLEX, CASE_FIELD_3_COMPLEX];
          previousPage.wizard_page_fields = [WIZARD_PAGE_2, WIZARD_PAGE_3];
          wizard.previousPage.and.returnValue(previousPage);
          wizard.pages = [previousPage, currentPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastName: new FormGroup({PersonMiddleName: new FormControl('John')}),
              Address: new FormGroup({AddressLine1: new FormControl('Street')})
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2_COMPLEX.id)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_2_COMPLEX.id}.PersonMiddleName`)).not.toBeNull();
          // 'PersonMiddleName' value expected to be null because this sub-field does not have
          // retain_hidden_value = true, even though its parent Complex field does
          expect(component.form.get('data').get(`${CASE_FIELD_2_COMPLEX.id}.PersonMiddleName`).value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3_COMPLEX.id)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_3_COMPLEX.id}.AddressLine1`)).not.toBeNull();
          expect(component.form.get('data').get(`${CASE_FIELD_3_COMPLEX.id}.AddressLine1`).value).toBeNull();
        });

        it('should navigate to previous page when previous is called and clear hidden collection form field', () => {
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COLLECTION.retain_hidden_value = true;
          CASE_FIELD_3_COLLECTION.retain_hidden_value = false;
          previousPage.case_fields = [CASE_FIELD_2_COLLECTION, CASE_FIELD_3_COLLECTION];
          previousPage.wizard_page_fields = [WIZARD_PAGE_2_COLLECTION, WIZARD_PAGE_3_COLLECTION];
          wizard.previousPage.and.returnValue(previousPage);
          wizard.pages = [currentPage, previousPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonLastNameCollection: new FormArray([new FormGroup({
                value: new FormGroup({PersonMiddleName: new FormControl('John')})
              })]),
              AddressCollection: new FormArray([new FormGroup({
                value: new FormGroup({AddressLine1: new FormControl('Street')})
              })])
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(component.form.get('data').get(CASE_FIELD_1.id)).not.toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_2_COLLECTION.id)).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_2_COLLECTION.id) as FormArray).at(0)
            .get('value.PersonMiddleName')).not.toBeNull();
          // 'PersonMiddleName' value expected to be null because this sub-field does not have
          // retain_hidden_value = true, even though its top-level collection field does
          expect((component.form.get('data').get(CASE_FIELD_2_COLLECTION.id) as FormArray).at(0)
            .get('value.PersonMiddleName').value).toBeNull();
          expect(component.form.get('data').get(CASE_FIELD_3_COLLECTION.id)).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_3_COLLECTION.id) as FormArray).at(0)
            .get('value.AddressLine1')).not.toBeNull();
          expect((component.form.get('data').get(CASE_FIELD_3_COLLECTION.id) as FormArray).at(0)
            .get('value.AddressLine1').value).toBeNull();
        });

        it('should not delete sub-field value if the FormGroup for the parent Complex hidden field cannot be determined', () => {
          spyOn(fieldsPurger, 'deleteFieldValue');
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_2_COMPLEX.retain_hidden_value = true;
          previousPage.case_fields = [CASE_FIELD_2_COMPLEX];
          previousPage.wizard_page_fields = [WIZARD_PAGE_2];
          wizard.previousPage.and.returnValue(previousPage);
          wizard.pages = [currentPage, previousPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              PersonFamilyName: new FormGroup({PersonMiddleName: new FormControl('John')})
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(fieldsPurger.deleteFieldValue).not.toHaveBeenCalled();
        });

        it('should not delete sub-field values if the FormArray for Complex hidden field parents collection cannot be determined', () => {
          spyOn(fieldsPurger, 'deleteFieldValue');
          component.wizard = wizard;
          const currentPage = new WizardPage();
          currentPage.wizard_page_fields = [WIZARD_PAGE_1];
          currentPage.case_fields = [CASE_FIELD_1];
          wizard.getPage.and.returnValue(currentPage);
          const previousPage = new WizardPage();
          previousPage.show_condition = 'PersonFirstName=\"John\"';
          CASE_FIELD_3_COLLECTION.retain_hidden_value = true;
          previousPage.case_fields = [CASE_FIELD_3_COLLECTION];
          previousPage.wizard_page_fields = [WIZARD_PAGE_3_COLLECTION];
          wizard.previousPage.and.returnValue(previousPage);
          wizard.pages = [currentPage, previousPage];
          component.form = new FormGroup({
            data: new FormGroup({
              PersonFirstName: new FormControl('Other'),
              AddressList: new FormArray([new FormGroup({
                value: new FormGroup({AddressLine1: new FormControl('Street')})
              })])
            })
          });
          fixture.detectChanges();

          component.previous('somePage');

          expect(wizard.previousPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(fieldsPurger.deleteFieldValue).not.toHaveBeenCalled();
        });
      });
    });

    it('should navigate to the page when navigateToPage is called', () => {
      component.wizard = wizard;
      wizard.getPage.and.returnValue(new WizardPage());
      fixture.detectChanges();
      component.navigateToPage('somePage');
      expect(wizard.getPage).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalled();
    });

    it('should emit cancel event when cancel is called', () => {
      component.cancel();
      expect(cancelHandler.applyFilters).toHaveBeenCalled();
    });

    describe('getStatus', () => {
      it('should get callback_response_status as vallback has failed', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        }
        const actual = component.getStatus(response);
        expect(actual).toEqual(response['callback_response_status']);
      });

      it('should get callback_response_status', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_COMPLETED'
        }
        const actual = component.getStatus(response);
        expect(actual).toEqual(response['delete_draft_response_status']);
      });
    })

    describe('emitSubmitted', () => {
      it('should emit submitted', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        }
        spyOn(component.submitted, 'emit');
        component.emitSubmitted(response);

        expect(component.submitted.emit).toHaveBeenCalled();
      });
    })

    describe('confirm', () => {
      it('should call routers navigate', () => {
        component.confirm({} as unknown as Confirmation);

        expect(routerStub.navigate).toHaveBeenCalled();
        expect(component.confirmation).toEqual({} as unknown as Confirmation);
      });
    })

    describe('getCaseId', () => {
      it('should return case id', () => {
        const actual = component.getCaseId({
          /* tslint:disable:object-literal-key-quotes */
          'case_id': 'case_id'
        } as unknown as CaseView);

        expect(actual).toEqual('case_id');
      });
    })

    describe('submitForm', () => {
      it('should submit case', () => {
        const mockClass = {
          submit: () => of({})
        }
        spyOn(mockClass, 'submit').and.returnValue(of({
          id: 'id',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED',
          /* tslint:disable:object-literal-key-quotes */
          'after_submit_callback_response': {
          /* tslint:disable:object-literal-key-quotes */
            'confirmation_header': 'confirmation_header',
          /* tslint:disable:object-literal-key-quotes */
            'confirmation_body': 'confirmation_body'
          }
        }))
        formValueService.sanitise.and.returnValue({name: 'sweet'})

        fixture.detectChanges();

        component.submitForm({
          eventTrigger: component.eventTrigger,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.isSubmitting).toEqual(true);
        expect(formValueService.sanitise).toHaveBeenCalled();
      });
    })

    describe('onEventCanBeCompleted', () => {
      it('should submit the case', () => {
        const mockClass = {
          submit: () => of({})
        }
        spyOn(mockClass, 'submit').and.returnValue(of({
          id: 'id',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED',
          /* tslint:disable:object-literal-key-quotes */
          'after_submit_callback_response': {
          /* tslint:disable:object-literal-key-quotes */
            'confirmation_header': 'confirmation_header',
          /* tslint:disable:object-literal-key-quotes */
            'confirmation_body': 'confirmation_body'
          }
        }))

        spyOn(component, 'confirm')

        component.isCaseFlagSubmission = true;
        component.isLinkedCasesSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'})
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).toHaveBeenCalled();
        expect(formValueService.populateLinkedCasesDetailsFromCaseFields).toHaveBeenCalled();
        expect(formValueService.removeComponentLauncherField).toHaveBeenCalled();
        expect(formValueService.removeFlagLauncherField).toHaveBeenCalled();
        expect(formValueService.populateFlagDetailsFromCaseFields).toHaveBeenCalled();
      });

      it('should NOT submit the case due to error', () => {
        const mockClass = {
          submit: () => of({})
        }
        spyOn(mockClass, 'submit').and.returnValue(throwError(({ details: 'details' } as unknown as HttpError)))
        spyOn(component, 'confirm')

        component.isCaseFlagSubmission = true;
        component.isLinkedCasesSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'})
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(formErrorService.mapFieldErrors).toHaveBeenCalled();
        expect(component.error).toEqual({ details: 'details' } as unknown as HttpError);
        expect(component.isSubmitting).toEqual(false);
      });

      it('should NOT submit the case and should navigate to tasks tab', () => {
        const mockClass = {
          submit: () => of({})
        }
        spyOn(mockClass, 'submit');

        spyOn(component, 'confirm')

        component.isCaseFlagSubmission = true;
        component.isLinkedCasesSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'})
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: false,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).not.toHaveBeenCalled();
        expect(mockClass.submit).not.toHaveBeenCalled();
        expect(routerStub.navigate).toHaveBeenCalled();
      });

      it('should emit submit as after_submit_callback_response is NOT present in response', () => {
        const mockClass = {
          submit: () => of({})
        }
        spyOn(mockClass, 'submit').and.returnValue(of({
          id: 'id',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        }))

        spyOn(component, 'confirm');
        spyOn(component, 'emitSubmitted');

        formValueService.sanitise.and.returnValue({name: 'sweet'})
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).not.toHaveBeenCalled();
        expect(component.emitSubmitted).toHaveBeenCalled();
      });
    })
  });

  xdescribe('profile not available in route', () => {
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
      isCourtAdmin: FUNC
    };

    const PROFILE_OBS: Observable<Profile> = of(PROFILE);

    beforeEach(waitForAsync(() => {
      cancelHandler = createSpyObj('cancelHandler', ['applyFilters']);
      cancelHandler.applyFilters.and.returnValue();

      submitHandler = createSpyObj('submitHandler', ['applyFilters']);
      submitHandler.applyFilters.and.returnValue();

      callbackErrorsSubject = createSpyObj('callbackErrorsSubject', ['next']);
      wizard = createSpyObj<Wizard>('wizard', ['getPage', 'firstPage', 'nextPage', 'previousPage', 'hasPreviousPage']);
      wizard.pages = [];
      formErrorService = createSpyObj<FormErrorService>('formErrorService', ['mapFieldErrors']);

      formValueService = createSpyObj<FormValueService>('formValueService', ['sanitise']);

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
        ]
      };
      const mockRouteNoProfile = {
        queryParams: of({Origin: 'viewDraft'}),
        params: of({id: 123}),
        snapshot: snapshotNoProfile
      };

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            PaletteUtilsModule,
            RouterTestingModule
          ],
          declarations: [
            CaseEditComponent,

            // Mocks
            eventTriggerHeaderComponentMock,
            routerLinkComponentMock,
            fieldReadComponentMock,
            fieldWriteComponentMock
          ],
          providers: [
            WizardFactoryService,
            {provide: FormErrorService, useValue: formErrorService},
            {provide: FormValueService, useValue: formValueService},
            {provide: FieldsUtils, useValue: fieldsUtils},
            {provide: FieldsPurger, useValue: fieldsPurger},
            {provide: ConditionalShowRegistrarService, useValue: registrarService},
            {provide: Router, useValue: routerStub},
            {provide: ActivatedRoute, useValue: mockRouteNoProfile},
            SessionStorageService,
            WindowService
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseEditComponent);
      component = fixture.componentInstance;
      component.wizard = wizard;
      component.eventTrigger = EVENT_TRIGGER;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);

      de = fixture.debugElement;
      fixture.detectChanges();
    }));
  });
});
