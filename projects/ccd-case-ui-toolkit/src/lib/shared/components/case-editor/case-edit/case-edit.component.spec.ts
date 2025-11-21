import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'ng2-mock-component';
import { Observable, of, Subject, throwError } from 'rxjs';
import { ConditionalShowRegistrarService } from '../../../directives';
import { CaseView, FieldType, HttpError, Profile } from '../../../domain';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { createCaseEventTrigger } from '../../../fixture/shared.test.fixture';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { AlertService, FieldsPurger, FieldsUtils, LoadingService, ReadCookieService, SessionStorageService, WindowService } from '../../../services';
import { FormErrorService, FormValueService } from '../../../services/form';
import { PaletteUtilsModule } from '../../palette';
import { Confirmation, Wizard, WizardPage, WizardPageField } from '../domain';
import { CaseNotifier, WorkAllocationService } from '../services';
import { WizardFactoryService } from '../services/wizard-factory.service';
import { ValidPageListCaseFieldsService } from '../services/valid-page-list-caseFields.service';
import { CaseEditComponent } from './case-edit.component';
import { AbstractAppConfig } from '../../../../app.config';
import createSpyObj = jasmine.createSpyObj;
import { LinkedCasesService } from '../../palette/linked-cases/services/linked-cases.service';
import { EventDetails, Task } from '../../../domain/work-allocation/Task';

describe('CaseEditComponent', () => {
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

  const CLIENT_CONTEXT = { client_context: {
    user_task: {
      task_data: {
        id: '1',
        name: 'Example task',
        case_id: '1234567890'
      },
      complete_task: true
    }
  }};

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
  let mockWorkAllocationService: jasmine.SpyObj<WorkAllocationService>;
  let mockAlertService: jasmine.SpyObj<AlertService>;
  let mockCookieService: jasmine.SpyObj<ReadCookieService>;
  let mockabstractConfig: jasmine.SpyObj<AbstractAppConfig>;
  const validPageListCaseFieldsService = new ValidPageListCaseFieldsService(fieldsUtils);

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
        'repopulateFormDataFromCaseFieldValues',
        'removeCaseFieldsOfType',
        'removeEmptyCollectionsWithMinValidation',
        'populateLinkedCasesDetailsFromCaseFields',
        'removeUnnecessaryFields'
      ]);
      mockSessionStorageService = createSpyObj<SessionStorageService>('SessionStorageService', ['getItem', 'removeItem', 'setItem']);
      mockWorkAllocationService = createSpyObj<WorkAllocationService>('WorkAllocationService', ['assignAndCompleteTask', 'completeTask']);
      mockAlertService = createSpyObj<AlertService>('AlertService', ['error', 'setPreserveAlerts']);
      mockCookieService = createSpyObj<ReadCookieService>('ReadCookieService', ['getCookie']);
      mockabstractConfig = createSpyObj<AbstractAppConfig>('AbstractAppConfig', ['logMessage']);
      spyOn(validPageListCaseFieldsService, 'deleteNonValidatedFields');
      spyOn(validPageListCaseFieldsService, 'validPageListCaseFields');

      route = {
        queryParams: of({ Origin: 'viewDraft' }),
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
            RouterTestingModule,
            eventTriggerHeaderComponentMock,
            routerLinkComponentMock,
            fieldReadComponentMock,
            fieldWriteComponentMock
          ],
          declarations: [
            CaseEditComponent,

            // Mocks
            FieldsFilterPipe
          ],
          providers: [
            WizardFactoryService,
            { provide: CaseNotifier, useValue: { cachedCaseView: null } },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: FormValueService, useValue: formValueService },
            { provide: FieldsUtils, useValue: fieldsUtils },
            { provide: FieldsPurger, useValue: fieldsPurger },
            { provide: ConditionalShowRegistrarService, useValue: registrarService },
            { provide: Router, useValue: routerStub },
            { provide: ActivatedRoute, useValue: route },
            { provide: WorkAllocationService, useValue: mockWorkAllocationService},
            { provide: SessionStorageService, useValue: mockSessionStorageService},
            { provide: AlertService, useValue: mockAlertService },
            { provide: ReadCookieService, useValue: mockCookieService },
            WindowService,
            { provide: LoadingService, loadingServiceMock },
            { provide: ValidPageListCaseFieldsService, useValue: validPageListCaseFieldsService},
            LinkedCasesService,
            { provide: AbstractAppConfig, useValue: mockabstractConfig }
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(CaseEditComponent);
      component = fixture.componentInstance;
      component.wizard = wizard;
      component.eventTrigger = EVENT_TRIGGER;
      component.cancelled.subscribe(cancelHandler.applyFilters);
      component.submitted.subscribe(submitHandler.applyFilters);
      mockSessionStorageService.getItem.and.returnValues('example url', 'true')
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
              PersonFirstName: new FormGroup({ PersonMiddleName: new FormControl('John') }),
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
              PersonFirstName: new FormArray([new FormGroup({ PersonMiddleName: new FormControl('John') })]),
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
              PersonFirstName: new FormGroup({ PersonMiddleName: new FormControl('John') }),
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
              PersonFirstName: new FormArray([new FormGroup({ PersonMiddleName: new FormControl('John') })]),
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
          expect(component.form.get('data').get(CASE_FIELD_2.id)).toBeNull();
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
              PersonLastName: new FormGroup({ PersonMiddleName: new FormControl('John') }),
              Address: new FormGroup({ AddressLine1: new FormControl('Street') })
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
          expect(component.form.get('data').get(CASE_FIELD_3_COMPLEX.id)).toBeNull();
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
                value: new FormGroup({ PersonMiddleName: new FormControl('John') })
              })]),
              AddressCollection: new FormArray([new FormGroup({
                value: new FormGroup({ AddressLine1: new FormControl('Street') })
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
          expect(component.form.get('data').get(CASE_FIELD_3_COLLECTION.id)).toBeNull();
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
              PersonFamilyName: new FormGroup({ PersonMiddleName: new FormControl('John') })
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
                value: new FormGroup({ AddressLine1: new FormControl('Street') })
              })])
            })
          });
          fixture.detectChanges();

          component.next('somePage');

          expect(wizard.nextPage).toHaveBeenCalled();
          expect(routerStub.navigate).toHaveBeenCalled();
          expect(fieldsPurger.deleteFieldValue).not.toHaveBeenCalled();
        });

        describe('next submitForm call', () => {
          beforeEach(() => {
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
            wizard.nextPage.and.returnValue(undefined);
            component.form = new FormGroup({
              data: new FormGroup({
                PersonFirstName: new FormControl('Other'),
                AddressList: new FormArray([new FormGroup({
                  value: new FormGroup({ AddressLine1: new FormControl('Street') })
                })])
              })
            });
          });

          it('should call submit form if next page is undefined, show event note is false, show summary is false', () => {
            const spyObj = jasmine.createSpyObj(['getNextPage']);
            spyObj.getNextPage.and.returnValue(undefined);
            component.eventTrigger.show_event_notes = false;
            component.eventTrigger.show_event_notes = false;
            spyOn(component, 'submitForm').and.callFake(() => { });
            fixture.detectChanges();
            component.next('somePage');
            expect(component.submitForm).toHaveBeenCalled();
          });

          it('should call submit form if next page is undefined, show event note is true, show summary is true', () => {
            const spyObj = jasmine.createSpyObj(['getNextPage']);
            spyObj.getNextPage.and.returnValue(undefined);
            component.eventTrigger.show_event_notes = true;
            component.eventTrigger.show_event_notes = true;
            spyOn(component, 'submitForm').and.callFake(() => { });
            fixture.detectChanges();
            component.next('somePage');
            expect(component.submitForm).not.toHaveBeenCalled();
          });

          it('should call submit form if next page is something, show event note is null, show summary is null', () => {
            const spyObj = jasmine.createSpyObj(['getNextPage']);
            spyObj.getNextPage.and.returnValue({ something: 'something' });
            component.eventTrigger.show_event_notes = null;
            component.eventTrigger.show_event_notes = null;
            spyOn(component, 'submitForm').and.callFake(() => { });
            fixture.detectChanges();
            component.next('somePage');
            expect(component.submitForm).toHaveBeenCalled();
          });
        });

        it('should check page is not refreshed', async () => {
          mockSessionStorageService.getItem.and.returnValue(component.initialUrl = null);
          mockSessionStorageService.getItem.and.returnValue(component.isPageRefreshed = false);
          routerStub.url = 'test.com';
          fixture.detectChanges();
          const result = await component.checkPageRefresh();
          expect(result).toBe(false);
        });

        it('should redirect to first wizard page when user navigates directly to submit without initialUrl', async () => {
          routerStub.url = '/some/case/path/submit';
          component.initialUrl = null;
          component.isPageRefreshed = false;
          component.eventTrigger = {
            wizard_pages: [
              { id: 'secondPage', order: 2 },
              { id: 'firstPage', order: 1 }
            ]
          } as any;

          spyOn((component as any).windowsService, 'alert');
          (routerStub.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

          const result = await component.checkPageRefresh();

          expect(result).toBeFalsy();
          expect((component as any).windowsService.alert).toHaveBeenCalledWith(CaseEditComponent.ALERT_MESSAGE);
          expect(routerStub.navigate).toHaveBeenCalledWith(['firstPage'], { relativeTo: (component as any).route });
        });

        it('should check page is refreshed', async () => {
          mockSessionStorageService.getItem.and.returnValue(component.initialUrl = 'test');
          mockSessionStorageService.getItem.and.returnValue(component.isPageRefreshed = true);

          fixture.detectChanges();
          const result = await component.checkPageRefresh();

          expect(result).toBe(true);
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
          expect(component.form.get('data').get(CASE_FIELD_2.id)).toBeNull();
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
              PersonLastName: new FormGroup({ PersonMiddleName: new FormControl('John') }),
              Address: new FormGroup({ AddressLine1: new FormControl('Street') })
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
          expect(component.form.get('data').get(CASE_FIELD_3_COMPLEX.id)).toBeNull();
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
                value: new FormGroup({ PersonMiddleName: new FormControl('John') })
              })]),
              AddressCollection: new FormArray([new FormGroup({
                value: new FormGroup({ AddressLine1: new FormControl('Street') })
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
          expect(component.form.get('data').get(CASE_FIELD_3_COLLECTION.id)).toBeNull();
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
              PersonFamilyName: new FormGroup({ PersonMiddleName: new FormControl('John') })
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
                value: new FormGroup({ AddressLine1: new FormControl('Street') })
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
      it('should get callback_response_status as callback has failed', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        };
        const actual = component.getStatus(response);
        expect(actual).toEqual(response['callback_response_status']);
      });

      it('should get callback_response_status', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_COMPLETED'
        };
        const actual = component.getStatus(response);
        expect(actual).toEqual(response['delete_draft_response_status']);
      });
    });

    describe('emitSubmitted', () => {
      it('should emit submitted', () => {
        const response = {
          /* tslint:disable:object-literal-key-quotes */
          'delete_draft_response_status': 'delete_draft_response_status',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        };
        spyOn(component.submitted, 'emit');
        component.emitSubmitted(response);

        expect(component.submitted.emit).toHaveBeenCalled();
      });
    });

    describe('confirm', () => {
      it('should call routers navigate', () => {
        component.confirm({} as unknown as Confirmation);

        expect(routerStub.navigate).toHaveBeenCalled();
        expect(component.confirmation).toEqual({} as unknown as Confirmation);
      });
    });

    describe('getCaseId', () => {
      it('should return case id', () => {
        const actual = component.getCaseId({
          /* tslint:disable:object-literal-key-quotes */
          'case_id': 'case_id'
        } as unknown as CaseView);

        expect(actual).toEqual('case_id');
      });
    });

    describe('submitForm', () => {
      it('should submit case', () => {
        const userInfo = {id: "id"};
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent', caseId: '123456789', userId: '1', createdTimestamp: Date.now()};
        mockSessionStorageService.getItem.and.returnValues(JSON.stringify(CLIENT_CONTEXT), JSON.stringify(mockTaskEventCompletionInfo), JSON.stringify({userInfo}))
        const mockClass = {
          submit: () => of({})
        };
        spyOn(mockClass, 'submit').and.returnValue(of({
          userInfo: {id: 'id'},
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED',
          /* tslint:disable:object-literal-key-quotes */
          'after_submit_callback_response': {
            /* tslint:disable:object-literal-key-quotes */
            'confirmation_header': 'confirmation_header',
            /* tslint:disable:object-literal-key-quotes */
            'confirmation_body': 'confirmation_body'
          }
        }));
        formValueService.sanitise.and.returnValue({ name: 'sweet' });

        fixture.detectChanges();

        component.submitForm({
          eventTrigger: component.eventTrigger,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.isSubmitting).toEqual(false);
        expect(formValueService.sanitise).toHaveBeenCalled();
      });
    });

    describe('onEventCanBeCompleted', () => {
      it('should submit the case', () => {
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({ name: 'sweet' });
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).toHaveBeenCalled();
        expect(formValueService.populateLinkedCasesDetailsFromCaseFields).toHaveBeenCalled();
        expect(formValueService.removeCaseFieldsOfType)
          .toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Array), ['FlagLauncher', 'ComponentLauncher']);
        expect(formValueService.repopulateFormDataFromCaseFieldValues).toHaveBeenCalled();
        expect(validPageListCaseFieldsService.deleteNonValidatedFields).toHaveBeenCalled();
        expect(validPageListCaseFieldsService.validPageListCaseFields).toHaveBeenCalled();
        expect(formValueService.removeUnnecessaryFields).toHaveBeenCalled();
        // check that tasks removed from session storage once event has been completed
        expect(mockSessionStorageService.removeItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT);
        expect(mockSessionStorageService.removeItem).toHaveBeenCalledWith(CaseEditComponent.TASK_EVENT_COMPLETION_INFO);
      });

      it('should submit the case for a Case Flags submission', () => {
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'});
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).toHaveBeenCalled();
        expect(formValueService.populateLinkedCasesDetailsFromCaseFields).toHaveBeenCalled();
        expect(formValueService.removeCaseFieldsOfType)
          .toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Array), ['FlagLauncher', 'ComponentLauncher']);
        expect(formValueService.repopulateFormDataFromCaseFieldValues).toHaveBeenCalled();
        expect(validPageListCaseFieldsService.deleteNonValidatedFields).toHaveBeenCalled();
        expect(validPageListCaseFieldsService.validPageListCaseFields).toHaveBeenCalled();
        expect(formValueService.removeUnnecessaryFields).not.toHaveBeenCalled();
      });

      it('should submit the case and assign and complete task for an event submission', () => {
        mockSessionStorageService.getItem.and.returnValues(JSON.stringify(CLIENT_CONTEXT), 'true');
        fixture.detectChanges();
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'});
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });
        expect(mockabstractConfig.logMessage).toHaveBeenCalledWith('postCompleteTaskIfRequired with assignNeeded: taskId 1 and event name Test Trigger');
        expect(mockWorkAllocationService.assignAndCompleteTask).toHaveBeenCalledWith('1', component.eventTrigger.name);
      });

      it('should submit the case and complete task for an event submission', () => {
        mockSessionStorageService.getItem.and.returnValues(JSON.stringify(CLIENT_CONTEXT), 'false');
        fixture.detectChanges();
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'});
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(mockWorkAllocationService.completeTask).toHaveBeenCalledWith('1', component.eventTrigger.name);
      });

      it('should submit the case and not complete task for an event submission when service makes this clear', () => {
        CLIENT_CONTEXT.client_context.user_task.complete_task = false;
        mockSessionStorageService.getItem.and.returnValues(JSON.stringify(CLIENT_CONTEXT), 'false');
        fixture.detectChanges();
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'});
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(mockWorkAllocationService.completeTask).not.toHaveBeenCalled();
      });

      it('should submit the case for a Case Flags submission', () => {
        const mockClass = {
          submit: () => of({})
        };
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
        }));

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({name: 'sweet'});
        component.onEventCanBeCompleted({
          eventTrigger: component.eventTrigger,
          eventCanBeCompleted: true,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.confirm).toHaveBeenCalled();
        expect(formValueService.populateLinkedCasesDetailsFromCaseFields).toHaveBeenCalled();
        expect(formValueService.removeCaseFieldsOfType)
          .toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Array), ['FlagLauncher', 'ComponentLauncher']);
        expect(formValueService.repopulateFormDataFromCaseFieldValues).toHaveBeenCalled();
        expect(validPageListCaseFieldsService.deleteNonValidatedFields).toHaveBeenCalled();
        expect(formValueService.removeUnnecessaryFields).not.toHaveBeenCalled();
      });

      it('should NOT submit the case due to error', () => {
        const mockClass = {
          submit: () => of({})
        };
        spyOn(mockClass, 'submit').and.returnValue(throwError(({ details: 'details' } as unknown as HttpError)));
        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.isLinkedCasesSubmission = true;
        component.confirmation = {} as unknown as Confirmation;

        formValueService.sanitise.and.returnValue({ name: 'sweet' });
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
        };
        spyOn(mockClass, 'submit');

        spyOn(component, 'confirm');

        component.isCaseFlagSubmission = true;
        component.isLinkedCasesSubmission = true;
        component.confirmation = {} as unknown as Confirmation;
        component.caseDetails = {
          case_type: {
            id: 'case_view_1_type_id',
            name: 'case view 1 type',
            jurisdiction: {
              id: 'case_view_1_jurisdiction_id',
              name: 'case view 1 jurisdiction',
            },
          },
          state: {
            id: 'case_view_1_state_id',
            name: 'case view 1 state',
          },
          channels: [],
          tabs: [],
          triggers: [],
          events: [],
          metadataFields: [],
          basicFields: {
            caseNameHmctsInternal: 'Dummy vs Dummy',
            caseManagementLocation: {
              baseLocation: 22
            }
          }
        };

        formValueService.sanitise.and.returnValue({ name: 'sweet' });
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
        };
        spyOn(mockClass, 'submit').and.returnValue(of({
          id: 'id',
          /* tslint:disable:object-literal-key-quotes */
          'callback_response_status': 'CALLBACK_HASNOT_COMPLETED'
        }));

        spyOn(component, 'confirm');
        spyOn(component, 'emitSubmitted');

        formValueService.sanitise.and.returnValue({ name: 'sweet' });
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
    });

    describe('taskExistsForThisEventAndCase', () => {
      const mockEventDetails: EventDetails = { eventId: 'testEvent', caseId: '123456789', userId: '1' };
      it('should return false when there is no task present', () => {
        expect(component.taskExistsForThisEvent(null, null, mockEventDetails)).toBe(false);
      });

      it('should return false when there is a task present that does not match the current case', () => {
        const mockTask = {id: '123', case_id: '987654321'};
        expect(component.taskExistsForThisEvent(mockTask as Task, null, mockEventDetails)).toBe(false);
      });

      it('should return true when there is a task present that matches the current case when there is no event in session storage', () => {
        const mockTask = {id: '123', case_id: '123456789', description: 'test test test [testEvent]'};
        expect(component.taskExistsForThisEvent(mockTask as Task, null, mockEventDetails)).toBe(true);
      });

      it('should return true when there is a task present that matches the current case and current event', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent', caseId: '123456789', userId: '1', createdTimestamp: Date.now()};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(true);
      });

      it('should return false when there is a task present that matches the current case but does not match the event', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent2', caseId: '123456789', userId: '1', createdTimestamp: Date.now()};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(false);
      });

      it('should return true when there is a task present that matches the current case, does not match the event but does not match the task associated with the event in session storage', () => {
        // highly unlikely to occur but feasible scenario
        const mockTask = {id: '123', case_id: '123456789'};
        const mockTaskEventCompletionInfo = {taskId: '1234', eventId: 'testEvent2', caseId: '123456789', userId: '1', createdTimestamp: Date.now()};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(true);
      });

      it('should return true when there is a task present that matches the current case, matches the event and does not match the task associated with the event in session storage', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const mockTaskEventCompletionInfo = {taskId: '1234', eventId: 'testEvent', caseId: '123456789', userId: '1', createdTimestamp: Date.now()};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(true);
      });

      it('should return false when there is a task present that matches the current case, matches the event but does not match the user', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent', caseId: '123456789', userId: '2', createdTimestamp: Date.now()};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(false);
      });

      it('should return false when there is a task present that matches the current case, matches the event but the timestamp is older than day ago', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const dayAndTwoHoursAgo = new Date().getTime() - (26*60*60*1000);
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent', caseId: '123456789', userId: '1', createdTimestamp: dayAndTwoHoursAgo};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(false);
      });

      it('should return true when there is a task present that matches the current case, matches the event but the timestamp is less than day ago', () => {
        const mockTask = {id: '123', case_id: '123456789'};
        const twoHoursAgo = new Date().getTime() - (2*60*60*1000);
        const mockTaskEventCompletionInfo = {taskId: '123', eventId: 'testEvent', caseId: '123456789', userId: '1', createdTimestamp: twoHoursAgo};
        expect(component.taskExistsForThisEvent(mockTask as Task, mockTaskEventCompletionInfo, mockEventDetails)).toBe(true);
      });
    });

    describe('error handling', () => {
      it('should handle submit errors gracefully', () => {
        const mockClass = {
          submit: () => throwError({ status: 500, message: 'Server error' })
        };

        formValueService.sanitise.and.returnValue({ name: 'test' });

        component.submitForm({
          eventTrigger: component.eventTrigger,
          caseDetails: component.caseDetails,
          form: component.form,
          submit: mockClass.submit,
        });

        expect(component.isSubmitting).toBe(false);
      });
    });

    describe('monitorBackButtonDuringRefresh', () => {
      it('should not navigate when isPageRefreshed is false', () => {
        // Override session storage responses for this test: initialUrl + isPageRefreshed
        mockSessionStorageService.getItem.and.returnValues('example url', 'false');
        // Re-run ngOnInit logic manually if needed
        component.isPageRefreshed = false;
        routerStub.navigate.calls.reset(); // clear any calls made during first detectChanges

        component.eventTrigger = {
          wizard_pages: [
            { id: 'firstPage', order: 1 },
            { id: 'secondPage', order: 2 }
          ]
        } as any;

        (component as any).monitorBackButtonDuringRefresh();

        expect(routerStub.navigate).not.toHaveBeenCalled();
      });
  
      it('should handle missing wizard pages gracefully', () => {
        component.isPageRefreshed = true;
        component.eventTrigger = {
          wizard_pages: []
        } as any;

        (component as any).monitorBackButtonDuringRefresh();

        expect(routerStub.navigate).not.toHaveBeenCalled();
      });

      it('should handle undefined wizard pages', () => {
        component.isPageRefreshed = true;
        component.eventTrigger = {} as any;

        (component as any).monitorBackButtonDuringRefresh();

        expect(routerStub.navigate).not.toHaveBeenCalled();
      });

      it('should not navigate if eventTrigger is null', () => {
        component.isPageRefreshed = true;
        component.eventTrigger = null;
        routerStub.navigate.calls.reset();

        (component as any).monitorBackButtonDuringRefresh();

        expect(routerStub.navigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('CaseEditComponent private field handlers', () => {
    let component: CaseEditComponent;

    // Minimal stubs for required constructor deps
    const stub = {} as any;
    const appConfigStub = { logMessage: () => {} } as any;

    beforeEach(() => {
      component = new CaseEditComponent(
        new FormBuilder(),
        stub, // CaseNotifier
        { events: new Subject(), navigate: () => Promise.resolve(true), navigateByUrl: () => Promise.resolve(true) } as any,
        { queryParams: of({}) } as any,
        stub, // FieldsUtils
        stub, // FieldsPurger
        stub, // ConditionalShowRegistrarService
        { create: () => ({}) } as any, // WizardFactoryService
        { getItem: () => null } as any, // SessionStorageService
        { alert: () => Promise.resolve() } as any, // WindowService
        { sanitise: (d: any) => d, clearNonCaseFields: () => {}, removeNullLabels: () => {}, removeEmptyDocuments: () => {},
          removeEmptyCollectionsWithMinValidation: () => {}, repopulateFormDataFromCaseFieldValues: () => {},
          populateLinkedCasesDetailsFromCaseFields: () => {}, removeCaseFieldsOfType: () => {} } as any,
        { mapFieldErrors: () => {} } as any, // FormErrorService
        { register: () => 't', unregister: () => {} } as any, // LoadingService
        { deleteNonValidatedFields: () => {}, validPageListCaseFields: () => [] } as any, // ValidPageListCaseFieldsService
        { assignAndCompleteTask: () => of(true), completeTask: () => of(true) } as any, // WorkAllocationService
        { error: () => {}, setPreserveAlerts: () => {} } as any, // AlertService
        appConfigStub, // AbstractAppConfig
        stub // ReadCookieService
      );
    });

    describe('handleNonComplexField', () => {
      it('should use parentField.formatted_value when parent has formatted_value', () => {
        const parentField: CaseField = {
          id: 'parent',
          formatted_value: { child: 'originalFromParent' }
        } as any;
        const caseField: CaseField = {
          id: 'child',
          formatted_value: 'shouldNotUseDirect'
        } as any;
        const rawFormValueData: any = {};

        (component as any).handleNonComplexField(parentField, rawFormValueData, 'child', caseField);

        expect(rawFormValueData['child']).toBe('originalFromParent');
      });

      it('should not overwrite when field is hidden and retain_hidden_value is true', () => {
        const caseField: CaseField = {
          id: 'child',
          hidden: true,
          retain_hidden_value: true,
          formatted_value: 'originalValue'
        } as any;
        const rawFormValueData: any = { child: 'existingValue' };

        (component as any).handleNonComplexField(null, rawFormValueData, 'child', caseField);

        expect(rawFormValueData['child']).toBe('existingValue');
      });

      it('should set formatted_value when no parent and not (hidden && retain_hidden_value)', () => {
        const caseField: CaseField = {
          id: 'child',
          hidden: false,
          retain_hidden_value: true, // hidden is false so condition fails
          formatted_value: 'directFormatted'
        } as any;
        const rawFormValueData: any = {};

        (component as any).handleNonComplexField(null, rawFormValueData, 'child', caseField);

        expect(rawFormValueData['child']).toBe('directFormatted');
      });
    });

    describe('handleComplexField', () => {
      it('should call replaceHiddenFormValuesWithOriginalCaseData and assign result when value is not null', () => {
        const subField: CaseField = {
          id: 'sub1',
          hidden: true,
          retain_hidden_value: true,
          formatted_value: 'sub1Original',
          field_type: { type: 'Text' } as any
        } as any;

        const complexField: CaseField = {
          id: 'complex1',
          value: {}, // triggers branch
          field_type: { type: 'Complex', complex_fields: [subField] } as any
        } as any;

        const formGroup = new FormGroup({
          complex1: new FormControl({ sub1: 'editedValue' })
        });

        const rawFormValueData: any = { complex1: { sub1: 'editedValue' } };

        const spy = spyOn(component as any, 'replaceHiddenFormValuesWithOriginalCaseData')
          .and.returnValue({ sub1: 'replacedValue' });

        (component as any).handleComplexField(complexField, formGroup, 'complex1', rawFormValueData);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(jasmine.any(FormGroup), [subField], complexField);
        expect(rawFormValueData['complex1']).toEqual({ sub1: 'replacedValue' });
      });

      it('should not modify rawFormValueData when complex field value is null', () => {
        const complexField: CaseField = {
          id: 'complex1',
          value: null,
          field_type: { type: 'Complex', complex_fields: [] } as any
        } as any;

        const formGroup = new FormGroup({
          complex1: new FormControl({ sub1: 'editedValue' })
        });

        const rawFormValueData: any = { complex1: { sub1: 'editedValue' } };

        const spy = spyOn(component as any, 'replaceHiddenFormValuesWithOriginalCaseData');

        (component as any).handleComplexField(complexField, formGroup, 'complex1', rawFormValueData);

        expect(spy).not.toHaveBeenCalled();
        expect(rawFormValueData['complex1']).toEqual({ sub1: 'editedValue' });
      });
    });
  });

  // Helper to build component with minimal deps
  function buildComponent(routerStub: any): CaseEditComponent {
    const stub = {} as any;
    return new CaseEditComponent(
      new FormBuilder(),
      stub,                    // CaseNotifier
      routerStub,              // Router
      { queryParams: of({}) } as any, // ActivatedRoute
      stub,                    // FieldsUtils
      stub,                    // FieldsPurger
      stub,                    // ConditionalShowRegistrarService
      { create: () => ({ firstPage: () => null, getPage: () => null }) } as any, // WizardFactoryService
      { getItem: () => null, removeItem: () => {} } as any, // SessionStorageService
      { alert: () => Promise.resolve() } as any,            // WindowService
      { sanitise: (d: any) => d, clearNonCaseFields: () => {}, removeNullLabels: () => {}, removeEmptyDocuments: () => {},
        removeEmptyCollectionsWithMinValidation: () => {}, repopulateFormDataFromCaseFieldValues: () => {},
        populateLinkedCasesDetailsFromCaseFields: () => {}, removeCaseFieldsOfType: () => {}, removeUnnecessaryFields: () => {} } as any,
      { mapFieldErrors: () => {} } as any,                  // FormErrorService
      { register: () => 'token', unregister: () => {} } as any, // LoadingService
      { deleteNonValidatedFields: () => {}, validPageListCaseFields: () => [] } as any, // ValidPageListCaseFieldsService
      { assignAndCompleteTask: () => of(true), completeTask: () => of(true) } as any,   // WorkAllocationService
      { error: () => {}, setPreserveAlerts: () => {} } as any, // AlertService
      { logMessage: () => {} } as any,                     // AbstractAppConfig
      stub                                                 // ReadCookieService
    );
  }

  describe('CaseEditComponent monitorBackButtonDuringRefresh', () => {
    it('should return early when router.events is undefined', () => {
      const routerStub = { navigateByUrl: () => Promise.resolve(true) }; // no events
      const component = buildComponent(routerStub);
      (component as any).monitorBackButtonDuringRefresh();
      expect((component as any).backSubscription).toBeUndefined();
    });

    it('should subscribe and set backButtonDuringRefresh=true on popstate when page refreshed and not acknowledged', () => {
      const events$ = new Subject<any>();
      const routerStub = {
        events: events$,
        navigateByUrl: () => Promise.resolve(true)
      };
      const component = buildComponent(routerStub);
      component.isPageRefreshed = true;
      component.pageRefreshAcknowledged = false;

      (component as any).monitorBackButtonDuringRefresh();
      expect((component as any).backSubscription).toBeDefined();

      expect(component.backButtonDuringRefresh).toBeFalsy();
      events$.next(new NavigationStart(1, '/prev', 'popstate'));
      expect(component.backButtonDuringRefresh).toBe(true);
    });

    it('should not set flag when page already acknowledged', () => {
      const events$ = new Subject<any>();
      const routerStub = { events: events$, navigateByUrl: () => Promise.resolve(true) };
      const component = buildComponent(routerStub);
      component.isPageRefreshed = true;
      component.pageRefreshAcknowledged = true;

      (component as any).monitorBackButtonDuringRefresh();
      events$.next(new NavigationStart(2, '/prev', 'popstate'));
      expect(component.backButtonDuringRefresh).toBeFalsy();
    });

    it('should ignore non-popstate navigation triggers', () => {
      const events$ = new Subject<any>();
      const routerStub = { events: events$, navigateByUrl: () => Promise.resolve(true) };
      const component = buildComponent(routerStub);
      component.isPageRefreshed = true;
      component.pageRefreshAcknowledged = false;

      (component as any).monitorBackButtonDuringRefresh();
      events$.next(new NavigationStart(3, '/prev', 'imperative'));
      expect(component.backButtonDuringRefresh).toBeFalsy();
    });

    it('should unsubscribe on ngOnDestroy', () => {
      const events$ = new Subject<any>();
      const routerStub = { events: events$, navigateByUrl: () => Promise.resolve(true) };
      const component = buildComponent(routerStub);
      component.isPageRefreshed = true;
      (component as any).monitorBackButtonDuringRefresh();
      const sub = (component as any).backSubscription;
      spyOn(sub, 'unsubscribe').and.callThrough();

      component.ngOnDestroy();
      expect(sub.unsubscribe).toHaveBeenCalled();
    });
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
        queryParams: of({ Origin: 'viewDraft' }),
        params: of({ id: 123 }),
        snapshot: snapshotNoProfile
      };

      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            PaletteUtilsModule,
            RouterTestingModule,
            eventTriggerHeaderComponentMock,
            routerLinkComponentMock,
            fieldReadComponentMock,
            fieldWriteComponentMock
          ],
          declarations: [
            CaseEditComponent
          ],
          providers: [
            WizardFactoryService,
            { provide: FormErrorService, useValue: formErrorService },
            { provide: FormValueService, useValue: formValueService },
            { provide: FieldsUtils, useValue: fieldsUtils },
            { provide: FieldsPurger, useValue: fieldsPurger },
            { provide: ConditionalShowRegistrarService, useValue: registrarService },
            { provide: Router, useValue: routerStub },
            { provide: ActivatedRoute, useValue: mockRouteNoProfile },
            SessionStorageService,
            WindowService,
            { provide: ValidPageListCaseFieldsService, useValue: validPageListCaseFieldsService},
            { provide: AbstractAppConfig, useValue: mockabstractConfig },
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
