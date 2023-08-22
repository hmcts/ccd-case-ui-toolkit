import {
  ChangeDetectorRef,
  CUSTOM_ELEMENTS_SCHEMA,
  DebugElement,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  AbstractControl,
  FormControl,
  UntypedFormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseEditValidationError } from '../../../commons/case-edit-data/case-edit-validation.model';
import { PlaceholderService } from '../../../directives/substitutor/services/placeholder.service';
import {
  CaseEventData,
  CaseEventTrigger,
  CaseField,
  Draft,
  DRAFT_PREFIX,
  FieldType,
  HttpError,
} from '../../../domain';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { CcdPageFieldsPipe } from '../../../pipes';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { CcdCaseTitlePipe } from '../../../pipes/case-title';
import { CcdCYAPageLabelFilterPipe } from '../../../pipes/complex/ccd-cyapage-label-filter.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import {
  CaseFieldService,
  FieldTypeSanitiser,
  FormErrorService,
  FormValueService,
  LoadingService,
} from '../../../services';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { SaveOrDiscardDialogComponent } from '../../dialogs/save-or-discard-dialog/save-or-discard-dialog.component';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { CaseEditGenericErrorsComponent } from '../case-edit-generic-errors/case-edit-generic-errors.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';
import { PageValidationService } from '../services';
import { CaseEditPageText } from './case-edit-page-text.enum';
import { CaseEditPageComponent } from './case-edit-page.component';

import createSpyObj = jasmine.createSpyObj;

describe('CaseEditPageComponent - creation and update event trigger tests', () => {
  let component: CaseEditPageComponent;

  const mockFormBuilder = jasmine.createSpyObj('FormBuilder', ['group']);
  const mockSearchService = jasmine.createSpyObj('SearchService', [
    'retrieveState',
    'storeState',
  ]);
  const mockStore = jasmine.createSpyObj('Store', ['dispatch']);

  const initializeComponent = ({
    caseEdit = {},
    formValueService = {},
    formErrorService = {},
    route = {},
    cdRef = {},
    pageValidationService = {},
    dialog = {},
    caseFieldService = {},
    caseEditDataService = {},
    loadingService = {},
  }) =>
    new CaseEditPageComponent(
      caseEdit as CaseEditComponent,
      route as ActivatedRoute,
      formValueService as FormValueService,
      formErrorService as FormErrorService,
      cdRef as ChangeDetectorRef,
      pageValidationService as PageValidationService,
      dialog as MatDialog,
      caseFieldService as CaseFieldService,
      caseEditDataService as CaseEditDataService,
      loadingService as LoadingService
    );

  it('should create', () => {
    component = initializeComponent({});

    expect(component).toBeTruthy();
  });

  describe('updateEventTriggerCaseFields', () => {
    it(`should NOT update event trigger's case fields as eventTrigger is null`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {} as unknown as CaseEventData;
      const eventTriggerMock = null;

      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock).toBeNull();
    });

    it(`should NOT update event trigger's case fields as eventTrigger has no case fields`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {} as unknown as CaseEventData;
      const eventTriggerMock = { id: 'noCaseFields' } as unknown as CaseEventTrigger;

      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock).toEqual(jasmine.objectContaining({ id: 'noCaseFields' }));
    });

    it(`should update event trigger's case fields value`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const jsonDataMock = {
        data: {
          bothDefendants: true
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: null
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(true);
    });

    it(`should update event trigger's case fields value with jsonData's object`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        value: true
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            value: true
          }
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: null
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should NOT update event trigger's case fields value as jsonData's value is null`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        people: {
          value: false
        }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            people: {
              list: ['sample', 'sample'],
              value: null
            }
          }

        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: result
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should NOT update event trigger's case fields value as jsonData's value is undefined`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        people: {
          value: false
        }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: {
            people: {
              list: ['sample', 'sample']
            }
          }
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: result
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });

    it(`should update event trigger's case fields value as jsonData's value is present`, () => {
      component = initializeComponent({});
      const caseFieldIdMock = 'bothDefendants';
      const result = {
        people: {
          value: true
        }
      };
      const jsonDataMock = {
        data: {
          bothDefendants: result
        }
      } as unknown as CaseEventData;
      const eventTriggerMock = {
        ['case_fields']: [
          {
            id: 'bothDefendants',
            label: 'Both Defendants',
            value: {
              people: {
                value: true
              }
            }
          }
        ],
      } as unknown as CaseEventTrigger;
      component.updateEventTriggerCaseFields(caseFieldIdMock, jsonDataMock, eventTriggerMock);

      expect(eventTriggerMock['case_fields'][0].value).toEqual(jasmine.objectContaining(result));
    });
  });
});

describe('CaseEditPageComponent - all other tests', () => {
  let de: DebugElement;
  const $SELECT_SUBMIT_BUTTON = By.css('button[type=submit]');
  const $SELECT_ERROR_SUMMARY = By.css('.error-summary');
  const $SELECT_ERROR_HEADING_GENERIC = By.css('.error-summary>h1:first-child');
  const $SELECT_ERROR_MESSAGE_GENERIC = By.css(
    '.govuk-error-summary__body>p:first-child'
  );
  const $SELECT_ERROR_HEADING_SPECIFIC = By.css(
    '.error-summary>h3:first-child'
  );
  const $SELECT_ERROR_MESSAGE_SPECIFIC = By.css(
    '.error-summary>p:nth-child(2)'
  );
  const $SELECT_CALLBACK_DATA_FIELD_ERROR_LIST = By.css('.error-summary-list');
  const $SELECT_FIRST_FIELD_ERROR = By.css('li:first-child');
  const $SELECT_SECOND_FIELD_ERROR = By.css('li:nth-child(2)');

  const ERROR_HEADING_GENERIC = 'Something went wrong';
  const ERROR_MESSAGE_GENERIC =
    'We\'re working to fix the problem. Try again shortly.';
  const ERROR_HEADING_SPECIFIC = 'The event could not be created';
  const ERROR_MESSAGE_SPECIFIC = 'There are field validation errors';

  let comp: CaseEditPageComponent;
  let fixture: ComponentFixture<CaseEditPageComponent>;
  let wizardPage = createWizardPage(
    [createCaseField('field1', 'field1Value')],
    false,
    0
  );
  const readOnly = new CaseField();
  const fieldTypeSanitiser = new FieldTypeSanitiser();
  const formValueService = new FormValueService(fieldTypeSanitiser);
  const formErrorService = new FormErrorService();
  const firstPage = new WizardPage();
  const caseFieldService = new CaseFieldService();
  const pageValidationService = new PageValidationService(caseFieldService);
  let route: any;
  let snapshot: any;
  const FORM_GROUP_NO_JUDICIAL_USERS = new UntypedFormGroup({
    data: new UntypedFormGroup({ field1: new FormControl('SOME_VALUE') }),
  });
  const FORM_GROUP = new UntypedFormGroup({
    data: new UntypedFormGroup({
      field1: new FormControl('SOME_VALUE'),
      judicialUserField1_judicialUserControl: new FormControl('Judicial User'),
      judicialUserField2_judicialUserControl: new FormControl('Judicial User 2'),
    }),
  });
  const WIZARD = new Wizard([wizardPage]);
  const draft = new Draft();
  draft.id = '1234abcd';
  const draftObservable = of(draft);
  let dialog: any;
  let matDialogRef: any;
  let caseEditDataService: any;
  let caseEditComponentStub: any;
  let cancelled: any;
  const caseField1 = new CaseField();
  const caseField2 = new CaseField();
  const eventData = new CaseEventData();
  const caseEventDataPrevious: CaseEventData = {
    data: {
      field1: 'Updated value',
      judicialUserField1_judicialUserControl: 'Judicial User',
      judicialUserField2_judicialUserControl: 'Judicial User 2',
    },
    event: { id: '', summary: '', description: '' },
    event_token: '',
    ignore_warning: true,
  };

  describe('Save and Resume enabled', () => {
    const eventTrigger = {
      case_fields: [caseField1],
      name: 'Test event trigger name',
      can_save_draft: true,
    };
    let loadingServiceMock: LoadingService;

    beforeEach(
      waitForAsync(() => {
        firstPage.id = 'first page';
        firstPage.case_fields = [
          createCaseField('field1', 'SOME_VALUE')
        ];
        cancelled = createSpyObj('cancelled', ['emit']);
        caseEditComponentStub = {
          form: FORM_GROUP,
          wizard: WIZARD,
          data: '',
          eventTrigger,
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [caseField2],
          },
          getNextPage: () => null,
          callbackErrorsSubject: new Subject<any>()
        };
        snapshot = {
          queryParamMap: createSpyObj('queryParamMap', ['get']),
        };
        route = {
          params: of({ id: 123 }),
          snapshot,
        };

        matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>(
          'MatDialogRef',
          ['afterClosed', 'close']
        );
        dialog = createSpyObj<MatDialog>('dialog', ['open']);
        dialog.open.and.returnValue(matDialogRef);

        spyOn(caseEditComponentStub, 'first');
        spyOn(caseEditComponentStub, 'next');
        spyOn(caseEditComponentStub, 'previous');

        caseEditDataService = {
          caseEventTriggerName$: of('ADD'),
          clearFormValidationErrors: createSpyObj('caseEditDataService', [
            'clearFormValidationErrors',
          ]),
          addFormValidationError: createSpyObj('caseEditDataService', [
            'addFormValidationError',
          ]),
          setCaseLinkError: createSpyObj('caseEditDataService', [
            'setCaseLinkError',
          ]),
          clearCaseLinkError: createSpyObj('caseEditDataService', [
            'clearCaseLinkError',
          ]),
          setCaseEventTriggerName: createSpyObj('caseEditDataService', [
            'setCaseEventTriggerName',
          ]),
          setCaseDetails: createSpyObj('caseEditDataService', [
            'setCaseDetails',
          ]),
          setCaseTitle: createSpyObj('caseEditDataService', [
            'setCaseTitle',
          ]),
          setCaseEditForm: createSpyObj('caseEditDataService', [
            'setCaseEditForm',
          ]),
          setTriggerSubmitEvent: createSpyObj('caseEditDataService', [
            'setTriggerSubmitEvent',
          ]),
          caseFormValidationErrors$: new BehaviorSubject<CaseEditValidationError[]>([]),
          caseEditForm$: of(caseEditComponentStub.form),
          caseIsLinkedCasesJourneyAtFinalStep$: of(false),
          caseTriggerSubmitEvent$: of(true)
        };
        loadingServiceMock = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);

        TestBed.configureTestingModule({
          imports: [FormsModule, ReactiveFormsModule],
          declarations: [
            CaseEditPageComponent,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock }
          ],
        }).compileComponents();
        fixture = TestBed.createComponent(CaseEditPageComponent);
        spyOn(caseEditDataService, 'setCaseEventTriggerName').and.callFake(() => { });
        spyOn(caseEditDataService, 'setCaseDetails').and.callFake(() => { });
        spyOn(caseEditDataService, 'setCaseTitle').and.callFake(() => { });
        spyOn(caseEditDataService, 'setCaseEditForm').and.callFake(() => { });
        spyOn(caseEditDataService, 'setCaseLinkError').and.callThrough();
        spyOn(caseEditDataService, 'clearFormValidationErrors').and.callFake(() => { });
        spyOn(caseEditDataService, 'setTriggerSubmitEvent').and.callFake(() => { });
        spyOn(pageValidationService, 'isPageValid').and.returnValue(true);
        comp = fixture.componentInstance;
        readOnly.display_context = 'READONLY';
        wizardPage = createWizardPage([
          createCaseField('field1', 'field1Value'),
        ]);
      })
    );

    it('should display a page with two columns when wizard page is multicolumn', () => {
      wizardPage.isMultiColumn = () => true;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      de = fixture.debugElement.query(By.css('#caseEditForm'));
      expect(de).toBeNull();
      de = fixture.debugElement.query(By.css('#caseEditForm1'));
      expect(de.nativeElement.textContent).toBeDefined();
      de = fixture.debugElement.query(By.css('#caseEditForm2'));
      expect(de.nativeElement.textContent).toBeDefined();
    });

    it('should display a page label in the header', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      de = fixture.debugElement.query(By.css('#page-header'));
      expect(de).toBeNull(); // Header is removed
    });

    it('should display an event trigger in the header', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      de = fixture.debugElement.query(By.css('#page-header'));
      expect(de).toBeNull(); // Header is removed
    });

    it('should display a page with one column when wizard page is not multicolumn', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      de = fixture.debugElement.query(By.css('#caseEditForm'));
      expect(de.nativeElement.textContent).toBeDefined();
      de = fixture.debugElement.query(By.css('#caseEditForm1'));
      expect(de).toBeNull();
      de = fixture.debugElement.query(By.css('#caseEditForm2'));
      expect(de).toBeNull();
    });

    it('should init to the provided first page in event trigger', () => {
      comp.ngOnInit();
      expect(comp.currentPage).toEqual(firstPage);
    });

    it('should return true on hasPrevious check', () => {
      const errorContext = {
        ignoreWarning: true,
        triggerText: 'Some error!',
      };
      comp.callbackErrorsNotify(errorContext);
      expect(comp.caseEdit.ignoreWarning).toBeTruthy();
      expect(comp.triggerText).toEqual('Some error!');
    });

    it('should emit RESUMED_FORM_DISCARD on create event if discard triggered with no value changed', () => {
      comp.eventTrigger = eventTrigger as CaseEventTrigger;
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      snapshot.queryParamMap.get.and.callFake((key) => {
        // tslint:disable-next-line: switch-default
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });

      fixture.detectChanges();
      comp.formValuesChanged = false;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.RESUMED_FORM_DISCARD,
      });
    });

    it('should emit NEW_FORM_DISCARD on create case if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.eventTrigger = eventTrigger as CaseEventTrigger;
      comp.currentPage = wizardPage;

      fixture.detectChanges();
      comp.formValuesChanged = false;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.NEW_FORM_DISCARD,
      });
    });

    it('should emit RESUMED_FORM_DISCARD on create event if discard triggered with value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      snapshot.queryParamMap.get.and.callFake((key) => {
        // tslint:disable-next-line: switch-default
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });

      matDialogRef.afterClosed.and.returnValue(of('Discard'));
      fixture.detectChanges();
      comp.formValuesChanged = true;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.RESUMED_FORM_DISCARD,
      });
    });

    it('should emit NEW_FORM_DISCARD on create case if discard triggered with value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.eventTrigger = eventTrigger as CaseEventTrigger;
      comp.currentPage = wizardPage;

      matDialogRef.afterClosed.and.returnValue(of('Discard'));
      fixture.detectChanges();
      comp.formValuesChanged = true;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.NEW_FORM_DISCARD,
      });
    });

    it('should emit RESUMED_FORM_SAVE on create event if save triggered with value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.eventTrigger = eventTrigger as CaseEventTrigger;
      comp.currentPage = wizardPage;
      snapshot.queryParamMap.get.and.callFake((key) => {
        // tslint:disable-next-line: switch-default
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });

      matDialogRef.afterClosed.and.returnValue(of('Save'));
      fixture.detectChanges();
      comp.formValuesChanged = true;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.RESUMED_FORM_SAVE,
        data: {
          data: {
            field1: 'SOME_VALUE',
            judicialUserField1_judicialUserControl: 'Judicial User',
            judicialUserField2_judicialUserControl: 'Judicial User 2',
          },
        },
      });
    });

    it('should emit NEW_FORM_SAVE on create case if save triggered with value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;

      matDialogRef.afterClosed.and.returnValue(of('Save'));
      fixture.detectChanges();
      comp.formValuesChanged = true;
      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageText.NEW_FORM_SAVE,
        data: {
          data: {
            field1: 'SOME_VALUE',
            judicialUserField1_judicialUserControl: 'Judicial User',
            judicialUserField2_judicialUserControl: 'Judicial User 2',
          },
        },
      });
    });

    it('should delegate first calls to caseEditComponent', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      comp.first();
      expect(caseEditComponentStub.first).toHaveBeenCalled();
    });

    it('should delegate next calls to caseEditComponent', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      comp.next();
      expect(caseEditComponentStub.next).toHaveBeenCalled();
    });

    it('should delegate prev calls to caseEditComponent', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      comp.previous();
      expect(caseEditComponentStub.previous).toHaveBeenCalled();
    });

    it('should allow empty values when field is OPTIONAL', () => {
      wizardPage.case_fields.push(
        aCaseField('fieldX', 'fieldX', 'Text', 'OPTIONAL', null)
      );
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeFalsy();
    });

    it('should return "Return to case list" as cancel button text if save and resume enabled for event', () => {
      wizardPage.isMultiColumn = () => true;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      const cancelText = comp.getCancelText();

      expect(cancelText).toEqual('Return to case list');
    });

    it('should init case fields to the event case fields when case details are not available', () => {
      caseEditComponentStub.caseDetails = null;
      comp.ngOnInit();
      expect(comp.caseFields).toEqual([caseField1]);
    });

    it('should init case fields to the provided case view fields', () => {
      comp.ngOnInit();
      expect(comp.caseFields).toEqual([caseField2]);
    });

    it('should unsubscribe from any Observables when the component is destroyed', () => {
      comp.ngOnInit();
      spyOn(comp.routeParamsSub, 'unsubscribe');
      spyOn(comp.caseEditFormSub, 'unsubscribe');
      spyOn(comp.caseIsLinkedCasesJourneyAtFinalStepSub, 'unsubscribe');
      spyOn(comp.caseTriggerSubmitEventSub, 'unsubscribe');
      spyOn(comp.validateSub, 'unsubscribe');
      spyOn(comp.saveDraftSub, 'unsubscribe');
      spyOn(comp.caseFormValidationErrorsSub, 'unsubscribe');
      expect(comp.routeParamsSub).toBeTruthy();
      expect(comp.caseEditFormSub).toBeTruthy();
      expect(comp.caseIsLinkedCasesJourneyAtFinalStepSub).toBeTruthy();
      expect(comp.caseTriggerSubmitEventSub).toBeTruthy();
      expect(comp.validateSub).toBeTruthy();
      expect(comp.saveDraftSub).toBeTruthy();
      expect(comp.caseFormValidationErrorsSub).toBeTruthy();
      comp.ngOnDestroy();
      expect(comp.routeParamsSub.unsubscribe).toHaveBeenCalled();
      expect(comp.caseEditFormSub.unsubscribe).toHaveBeenCalled();
      expect(comp.caseIsLinkedCasesJourneyAtFinalStepSub.unsubscribe).toHaveBeenCalled();
      expect(comp.caseTriggerSubmitEventSub.unsubscribe).toHaveBeenCalled();
      expect(comp.validateSub.unsubscribe).toHaveBeenCalled();
      expect(comp.saveDraftSub.unsubscribe).toHaveBeenCalled();
      expect(comp.caseFormValidationErrorsSub.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Save and Resume disabled', () => {
    let loadingServiceMock: jasmine.SpyObj<LoadingService>;

    beforeEach(
      waitForAsync(() => {
        firstPage.id = 'first page';
        firstPage.case_fields = [
          createCaseField('field1', 'SOME_VALUE')
        ];
        cancelled = createSpyObj('cancelled', ['emit']);
        caseEditComponentStub = {
          form: FORM_GROUP,
          wizard: WIZARD,
          data: '',
          eventTrigger: {
            case_fields: [],
            name: 'Test event trigger name',
            can_save_draft: false,
          },
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [],
          },
          getNextPage: () => null,
          callbackErrorsSubject: new Subject<any>()
        };
        snapshot = {
          queryParamMap: createSpyObj('queryParamMap', ['get']),
        };
        route = {
          params: of({ id: 123 }),
          snapshot,
        };

        matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>(
          'MatDialogRef',
          ['afterClosed', 'close']
        );
        dialog = createSpyObj<MatDialog>('dialog', ['open']);
        dialog.open.and.returnValue(matDialogRef);

        spyOn(caseEditComponentStub, 'first');
        spyOn(caseEditComponentStub, 'next');
        spyOn(caseEditComponentStub, 'previous');

        caseEditDataService = {
          caseEventTriggerName$: of('ADD'),
          clearFormValidationErrors: createSpyObj('caseEditDataService', [
            'clearFormValidationErrors',
          ]),
          addFormValidationError: createSpyObj('caseEditDataService', [
            'addFormValidationError',
          ]),
          setCaseLinkError: createSpyObj('caseEditDataService', [
            'setCaseLinkError',
          ]),
          clearCaseLinkError: createSpyObj('caseEditDataService', [
            'clearCaseLinkError',
          ]),
          setCaseEventTriggerName: createSpyObj('caseEditDataService', [
            'setCaseEventTriggerName',
          ]),
          setCaseDetails: createSpyObj('caseEditDataService', [
            'setCaseDetails',
          ]),
          setCaseTitle: createSpyObj('caseEditDataService', [
            'setCaseTitle',
          ]),
          setCaseEditForm: createSpyObj('caseEditDataService', [
            'setCaseEditForm',
          ]),
          setTriggerSubmitEvent: createSpyObj('caseEditDataService', [
            'setTriggerSubmitEvent',
          ]),
          caseFormValidationErrors$: new BehaviorSubject<CaseEditValidationError[]>([]),
          caseEditForm$: of(caseEditComponentStub.form),
          caseIsLinkedCasesJourneyAtFinalStep$: of(false),
          caseTriggerSubmitEvent$: of(true)
        };

        loadingServiceMock = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);

        TestBed.configureTestingModule({
          declarations: [
            CaseEditPageComponent,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock },
          ],
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      spyOn(caseEditDataService, 'setCaseEventTriggerName').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseDetails').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseTitle').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseEditForm').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseLinkError').and.callThrough();
      spyOn(caseEditDataService, 'clearFormValidationErrors').and.callFake(() => { });
      comp = fixture.componentInstance;
      readOnly.display_context = 'READONLY';
      wizardPage = createWizardPage(
        [createCaseField('field1', 'field1Value')],
        true
      );
      comp.currentPage = wizardPage;
    });

    it('should return "Cancel" as cancel button text if save and resume not enabled for event', () => {
      fixture.detectChanges();

      const cancelText = comp.getCancelText();

      expect(cancelText).toEqual('Cancel');
    });

    it('should emit cancelled with no event if save and resume not enabled', () => {
      fixture.detectChanges();

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalled();
      expect(cancelled.emit).not.toHaveBeenCalledWith({
        status: CaseEditPageText.RESUMED_FORM_DISCARD,
      });
      expect(cancelled.emit).not.toHaveBeenCalledWith({
        status: CaseEditPageText.NEW_FORM_DISCARD,
      });
      expect(cancelled.emit).not.toHaveBeenCalledWith({
        status: CaseEditPageText.RESUMED_FORM_SAVE,
      });
      expect(cancelled.emit).not.toHaveBeenCalledWith({
        status: CaseEditPageText.NEW_FORM_SAVE,
      });
    });
  });

  describe('updateFormData - should set data', () => {
    const eventTrigger: CaseEventTrigger = {
      id: 'someId',
      name: 'Test event trigger name',
      case_fields: [createCaseField('field1', 'oldValue')],
      event_token: 'Test event token',
      can_save_draft: false,
      wizard_pages: WIZARD.pages,

      hasFields: () => true,
      hasPages: () => true,
    };
    let loadingServiceMock: jasmine.SpyObj<LoadingService>;

    const formGroup: UntypedFormGroup = new UntypedFormGroup({
      data: new UntypedFormGroup({ field1: new FormControl('SOME_VALUE') }),
    });

    beforeEach(
      waitForAsync(() => {
        firstPage.id = 'first page';

        caseEditComponentStub = {
          form: UntypedFormGroup,
          wizard: WIZARD,
          data: '',
          eventTrigger,
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [],
            state: {
              id: 'incompleteApplication',
              name: 'Incomplete Application',
              title_display: '# 1234567812345678: test',
            },
          },
          getNextPage: () => null
        };

        route = {
          params: of({ id: 123 }),
          snapshot,
        };

        caseEditDataService = {
          caseEventTriggerName$: of('ADD'),
          clearFormValidationErrors: createSpyObj('caseEditDataService', [
            'clearFormValidationErrors',
          ]),
          addFormValidationError: createSpyObj('caseEditDataService', [
            'addFormValidationError',
          ]),
          setCaseLinkError: createSpyObj('caseEditDataService', [
            'setCaseLinkError',
          ]),
          clearCaseLinkError: createSpyObj('caseEditDataService', [
            'clearCaseLinkError',
          ]),
          setCaseEventTriggerName: createSpyObj('caseEditDataService', [
            'setCaseEventTriggerName',
          ]),
          setCaseDetails: createSpyObj('caseEditDataService', [
            'setCaseDetails',
          ]),
          setCaseTitle: createSpyObj('caseEditDataService', [
            'setCaseTitle',
          ]),
          setCaseEditForm: createSpyObj('caseEditDataService', [
            'setCaseEditForm',
          ]),
          caseFormValidationErrors$: new BehaviorSubject<CaseEditValidationError[]>([]),
          caseEditForm$: of(caseEditComponentStub.form),
          caseIsLinkedCasesJourneyAtFinalStep$: of(false),
          caseTriggerSubmitEvent$: of(true)
        };

        loadingServiceMock = createSpyObj<LoadingService>('LoadingService', ['register', 'unregister']);

        TestBed.configureTestingModule({
          declarations: [
            CaseEditPageComponent,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock },
          ],
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;

      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')]);
      comp.currentPage = wizardPage;
      comp.wizard = new Wizard([wizardPage]);
      comp.editForm = FORM_GROUP;
      spyOn(caseEditDataService, 'setCaseEventTriggerName').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseDetails').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseTitle').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseEditForm').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseLinkError').and.callThrough();
      spyOn(caseEditDataService, 'clearFormValidationErrors').and.callFake(() => { });
      fixture.detectChanges();
    });

    it('should update CaseEventTrigger field value from the MidEvent callback', () => {
      const id = 'field1';
      const updatedValue = 'Updated value';
      const jsonData: CaseEventData = {
        data: {
          field1: updatedValue,
        },
        event: { id: '', summary: '', description: '' },
        event_token: '',
        ignore_warning: true,
      };
      comp.updateFormData(jsonData);

      fixture.detectChanges();

      expect(
        eventTrigger.case_fields.filter((element) => element.id === id).pop()
          .value
      ).toBe(updatedValue);
    });

    it('should show valid title on the page', () => {
      wizardPage.isMultiColumn = () => true;
      fixture.detectChanges();
      const title = comp.getCaseTitle();
      expect(title).toEqual('# 1234567812345678: test');
    });
  });

  describe('submit the form', () => {
    const loadingServiceMock = jasmine.createSpyObj('loadingService', ['register', 'unregister']);

    beforeEach(
      waitForAsync(() => {
        firstPage.id = 'first page';
        cancelled = createSpyObj('cancelled', ['emit']);
        const validateResult = {
          data: {
            field1: 'EX12345678',
          },
        };

        const caseFields: CaseField[] = [
          createCaseField('field1', 'field1Value'),
        ];

        caseEditComponentStub = {
          form: FORM_GROUP,
          wizard: WIZARD,
          data: '',
          eventTrigger: {
            case_fields: caseFields,
            name: 'Test event trigger name',
            can_save_draft: true,
            event_token: 'Token'
          },
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData, pageId: string) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [caseField2],
          },
          getNextPage: () => null,
          callbackErrorsSubject: new Subject<any>(),
          ignoreWarning: true
        };
        snapshot = {
          queryParamMap: createSpyObj('queryParamMap', ['get']),
        };
        route = {
          params: of({ id: 123 }),
          snapshot,
        };

        matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>(
          'MatDialogRef',
          ['afterClosed', 'close']
        );
        dialog = createSpyObj<MatDialog>('dialog', ['open']);
        dialog.open.and.returnValue(matDialogRef);

        spyOn(caseEditComponentStub, 'first');
        spyOn(caseEditComponentStub, 'next');
        spyOn(caseEditComponentStub, 'previous');
        spyOn(caseEditComponentStub, 'validate').and.returnValue(
          of(validateResult)
        );
        spyOn(formValueService, 'sanitise').and.returnValue(eventData);
        spyOn(formValueService, 'sanitiseDynamicLists').and.returnValue(
          eventData
        );
        spyOn(formValueService, 'removeUnnecessaryFields');

        caseEditDataService = createSpyObj('caseEditDataService',
          [
            'setCaseEditForm',
            'setCaseDetails',
            'setCaseEventTriggerName',
            'setCaseLinkError',
            'clearCaseLinkError',
            'clearFormValidationErrors',
            'addFormValidationError',
            'setCaseTitle',
            'setTriggerSubmitEvent',
            'getNextPage'
          ]
        );
        caseEditDataService.caseTriggerSubmitEvent$ = of(true);
        caseEditDataService.caseFormValidationErrors$ = new BehaviorSubject<CaseEditValidationError[]>([]);
        caseEditDataService.caseEditForm$ = of(caseEditComponentStub.form);
        caseEditDataService.caseIsLinkedCasesJourneyAtFinalStep$ = of(false);

        TestBed.configureTestingModule({
          declarations: [
            CaseEditPageComponent,
            FieldsFilterPipe,
            CcdPageFieldsPipe,
            CcdCYAPageLabelFilterPipe,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            CaseEditGenericErrorsComponent,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock },
          ],
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;

      wizardPage = createWizardPage(
        [
          createCaseField('field1', 'field1Value'),
          aCaseField('judicialUserField1', 'judicialUser1', 'JudicialUser', 'OPTIONAL', null),
          aCaseField('judicialUserField2', 'judicialUser2', 'JudicialUser', 'OPTIONAL', null),
        ],
        false,
        0
      );
      comp.wizard = new Wizard([wizardPage]);
      // Rebuild the FORM_GROUP object before use because it gets modified by the "should call validate" test
      (FORM_GROUP.get('data') as UntypedFormGroup).setControl(
        'judicialUserField1_judicialUserControl', new FormControl('Judicial User'));
      (FORM_GROUP.get('data') as UntypedFormGroup).setControl(
        'judicialUserField2_judicialUserControl', new FormControl('Judicial User 2'));
      comp.editForm = FORM_GROUP;
      comp.currentPage = wizardPage;

      de = fixture.debugElement;
      spyOn(comp, 'submit').and.callThrough();
      spyOn(comp, 'buildCaseEventData').and.callThrough();
      spyOn(comp, 'next').and.callThrough();
    });

    it('should call validate', async () => {
      const ignoreWarningOriginalValue = comp.caseEdit.ignoreWarning;
      expect(eventData.case_reference).toBeUndefined();
      expect(loadingServiceMock.register).not.toHaveBeenCalled();

      // Calling ngOnInit() calls submit(), which in turn calls buildCaseEventData(), loadingService.register() and
      // CaseEditComponent.validate(). The validate() function calls saveDraft() and next(), and next() calls
      // resetErrors(). This resets properties on CaseEditComponent: error, ignoreWarning, and callbackErrorsSubject
      // to null, false, and next(null) respectively
      comp.ngOnInit();

      expect(comp.submit).toHaveBeenCalled();
      expect(comp.buildCaseEventData).toHaveBeenCalled();
      expect(formValueService.sanitiseDynamicLists).toHaveBeenCalled();
      expect(formValueService.sanitise).toHaveBeenCalled();
      expect(formValueService.removeUnnecessaryFields).toHaveBeenCalled();
      expect(loadingServiceMock.register).toHaveBeenCalled();

      fixture.whenStable().then(() => {
        expect(comp.caseEdit.eventTrigger.case_id).toEqual(DRAFT_PREFIX + draft.id);
        expect(eventData.case_reference).toEqual(caseEditComponentStub.caseDetails.case_id);
        expect(caseEditComponentStub.validate).toHaveBeenCalledWith(eventData, wizardPage.id);
        expect(loadingServiceMock.unregister).toHaveBeenCalled();
        expect(comp.next).toHaveBeenCalled();

        // TODO: Figure out what on Earth is going on with these unit tests as there seems
        // to be no way to affect eventData with the current configuration.
        // I will likely create an additional unit test for the buildCaseEventData method.
        // expect(eventData.event_data).toEqual(FORM_GROUP.value.data);
        // expect(eventData.data).toEqual(FORM_GROUP.value.data);

        // At this point, caseEdit.ignoreWarning will have been reset to false by resetErrors(); check against its
        // original value
        expect(eventData.ignore_warning).toEqual(ignoreWarningOriginalValue);
        expect(eventData.event_token).toEqual(comp.eventTrigger.event_token);
        expect(comp.caseEdit.error).toBeNull();
        expect(comp.caseEdit.ignoreWarning).toBe(false);

        // Both JudicialUser FormControls should have been removed from the editForm UntypedFormGroup, leaving just one
        // FormControl
        const formControlKeys = Object.keys((comp.editForm.get('data') as UntypedFormGroup).controls);
        const formControlKeysWithJudicialUsers = Object.keys((FORM_GROUP.get('data') as UntypedFormGroup).controls);
        expect(formControlKeys.length).toBe(1);
        expect(formControlKeys.includes(formControlKeysWithJudicialUsers[0])).toBe(true);
        expect(formControlKeys.includes(formControlKeysWithJudicialUsers[1])).toBe(false);
        expect(formControlKeys.includes(formControlKeysWithJudicialUsers[2])).toBe(false);
      });
    });

    it('should display generic error heading and message when form error is set but no callback errors, warnings, or error details', () => {
      // This tests CaseEditGenericErrorsComponent
      spyOn(pageValidationService, 'isPageValid').and.returnValue(false);
      comp.caseEdit.error = {
        status: 200,
        callbackErrors: null,
        callbackWarnings: null,
        details: null,
      } as HttpError;

      fixture.detectChanges();
      expect(comp.submit).toHaveBeenCalled();
      expect(comp.currentPageIsNotValid()).toBe(true);
      const error = de.query($SELECT_ERROR_SUMMARY);
      expect(error).toBeTruthy();

      const errorHeading = error.query($SELECT_ERROR_HEADING_GENERIC);
      expect(text(errorHeading)).toBe(ERROR_HEADING_GENERIC);

      const errorMessage = error.query($SELECT_ERROR_MESSAGE_GENERIC);
      expect(text(errorMessage)).toBe(ERROR_MESSAGE_GENERIC);

      // The page is not valid, so the editForm UntypedFormGroup should still have the two JudicialUser FormControls because
      // their removal is not triggered
      const formControlKeys = Object.keys((comp.editForm.get('data') as UntypedFormGroup).controls);
      const formControlKeysWithJudicialUsers = Object.keys((FORM_GROUP.get('data') as UntypedFormGroup).controls);
      expect(formControlKeys.length).toBe(3);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[0])).toBe(true);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[1])).toBe(true);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[2])).toBe(true);
    });

    it('should display specific error heading and message, and callback data field validation errors (if any)', () => {
      // This tests CaseEditGenericErrorsComponent
      spyOn(pageValidationService, 'isPageValid').and.returnValue(false);
      comp.caseEdit.error = {
        status: 422,
        callbackErrors: null,
        callbackWarnings: null,
        details: {
          field_errors: [
            {
              message: 'First field error',
            },
            {
              message: 'Second field error',
            },
          ],
        },
        message: 'There are field validation errors',
      } as HttpError;

      fixture.detectChanges();
      expect(comp.submit).toHaveBeenCalled();
      expect(comp.currentPageIsNotValid()).toBe(true);
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

      // The page is not valid, so the editForm UntypedFormGroup should still have the two JudicialUser FormControls because
      // their removal is not triggered
      const formControlKeys = Object.keys((comp.editForm.get('data') as UntypedFormGroup).controls);
      const formControlKeysWithJudicialUsers = Object.keys((FORM_GROUP.get('data') as UntypedFormGroup).controls);
      expect(formControlKeys.length).toBe(3);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[0])).toBe(true);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[1])).toBe(true);
      expect(formControlKeys.includes(formControlKeysWithJudicialUsers[2])).toBe(true);
    });

    it('should not display generic error heading and message when there are specific callback errors', () => {
      comp.caseEdit.error = {
        status: 422,
        callbackErrors: ['First error', 'Second error'],
        callbackWarnings: null,
        details: null,
      } as HttpError;

      fixture.detectChanges();

      const error = de.query($SELECT_ERROR_SUMMARY);
      expect(error).toBeFalsy();
    });

    it('should not display generic error heading and message when there are specific callback warnings', () => {
      comp.caseEdit.error = {
        status: 422,
        callbackErrors: null,
        callbackWarnings: ['First warning', 'Second warning'],
        details: null,
      } as HttpError;

      fixture.detectChanges();

      const error = de.query($SELECT_ERROR_SUMMARY);
      expect(error).toBeFalsy();
    });

    it('should change button label when callback warnings notified', () => {
      comp.ngOnInit();
      fixture.detectChanges();
      const callbackErrorsContext: CallbackErrorsContext =
        new CallbackErrorsContext();
      callbackErrorsContext.triggerText = CaseEditPageText.TRIGGER_TEXT_START;
      comp.callbackErrorsNotify(callbackErrorsContext);

      fixture.detectChanges();
      const button = de.query($SELECT_SUBMIT_BUTTON);
      expect(button.nativeElement.textContent).toEqual(
        CaseEditPageText.TRIGGER_TEXT_START
      );
      expect(comp.caseEdit.ignoreWarning).toBeFalsy();

      callbackErrorsContext.ignoreWarning = true;
      callbackErrorsContext.triggerText =
        CaseEditPageText.TRIGGER_TEXT_CONTINUE;
      comp.callbackErrorsNotify(callbackErrorsContext);

      fixture.detectChanges();
      expect(button.nativeElement.textContent).toEqual(
        CaseEditPageText.TRIGGER_TEXT_CONTINUE
      );
      expect(comp.caseEdit.ignoreWarning).toBeTruthy();
    });
  });

  describe('previous the form', () => {
    beforeEach(
      waitForAsync(() => {
        const loadingServiceMock = jasmine.createSpyObj('loadingService', ['register', 'unregister']);
        firstPage.id = 'first page';
        cancelled = createSpyObj('cancelled', ['emit']);
        const caseFields: CaseField[] = [
          createCaseField('field1', 'field1Value'),
        ];

        caseEditComponentStub = {
          form: FORM_GROUP,
          wizard: WIZARD,
          data: '',
          eventTrigger: {
            case_fields: caseFields,
            name: 'Test event trigger name',
            can_save_draft: true,
          },
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData, pageId: string) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [caseField2],
          },
          getNextPage: () => null,
          callbackErrorsSubject: new Subject<any>()
        };
        snapshot = {
          queryParamMap: createSpyObj('queryParamMap', ['get']),
        };
        route = {
          params: of({ id: 123 }),
          snapshot,
        };

        matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>(
          'MatDialogRef',
          ['afterClosed', 'close']
        );
        dialog = createSpyObj<MatDialog>('dialog', ['open']);
        dialog.open.and.returnValue(matDialogRef);

        spyOn(caseEditComponentStub, 'previous');
        spyOn(formValueService, 'sanitise').and.returnValue(
          caseEventDataPrevious
        );
        spyOn(formValueService, 'sanitiseDynamicLists').and.returnValue(
          caseEventDataPrevious
        );

        caseEditDataService = {
          caseEventTriggerName$: of('ADD'),
          clearFormValidationErrors: createSpyObj('caseEditDataService', [
            'clearFormValidationErrors',
          ]),
          addFormValidationError: createSpyObj('caseEditDataService', [
            'addFormValidationError',
          ]),
          setCaseLinkError: createSpyObj('caseEditDataService', [
            'setCaseLinkError',
          ]),
          clearCaseLinkError: createSpyObj('caseEditDataService', [
            'clearCaseLinkError',
          ]),
          setCaseEventTriggerName: createSpyObj('caseEditDataService', [
            'setCaseEventTriggerName',
          ]),
          setCaseDetails: createSpyObj('caseEditDataService', [
            'setCaseDetails',
          ]),
          setCaseTitle: createSpyObj('caseEditDataService', [
            'setCaseTitle',
          ]),
          setCaseEditForm: createSpyObj('caseEditDataService', [
            'setCaseEditForm',
          ]),
          caseFormValidationErrors$: new BehaviorSubject<CaseEditValidationError[]>([]),
          caseEditForm$: of(caseEditComponentStub.form),
          caseIsLinkedCasesJourneyAtFinalStep$: of(false),
          caseTriggerSubmitEvent$: of(true)
        };

        TestBed.configureTestingModule({
          declarations: [
            CaseEditPageComponent,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock }
          ],
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;

      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')]);
      comp.currentPage = wizardPage;

      de = fixture.debugElement;
      spyOn(caseEditDataService, 'setCaseEventTriggerName').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseDetails').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseTitle').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseEditForm').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseLinkError').and.callThrough();
      spyOn(caseEditDataService, 'clearFormValidationErrors').and.callFake(() => { });
      spyOn(comp, 'buildCaseEventData').and.callThrough();
      fixture.detectChanges();
    });

    it('should call update after toPreviousPage', async () => {
      fixture.detectChanges();
      comp.toPreviousPage();
      fixture.whenStable().then(() => {
        expect(caseEventDataPrevious.case_reference).toEqual(
          caseEditComponentStub.caseDetails.case_id
        );
        // The call to buildCaseEventData() removes the additional JudicialUser FormControls before returning the
        // CaseEventData to be submitted
        expect(comp.buildCaseEventData).toHaveBeenCalled();
        expect(caseEventDataPrevious.event_data).toEqual(FORM_GROUP_NO_JUDICIAL_USERS.value.data);
        expect(caseEventDataPrevious.ignore_warning).toEqual(
          comp.caseEdit.ignoreWarning
        );
        expect(caseEventDataPrevious.event_token).toEqual(
          comp.eventTrigger.event_token
        );
        expect(formValueService.sanitise).toHaveBeenCalled();
        expect(formValueService.sanitiseDynamicLists).toHaveBeenCalled();
      });
    });
  });

  describe('Check for Validation Error', () => {
    const F_GROUP = new UntypedFormGroup({
      data: new UntypedFormGroup({
        Invalidfield1: new FormControl(null, Validators.required),
        Invalidfield2: new FormControl(null, [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
        ]),
        OrganisationField: new FormControl(null, Validators.required),
        complexField1: new FormControl(null, Validators.required),
        FlagLauncherField: new FormControl(null, {
          validators: (
            _: AbstractControl
          ): { [key: string]: boolean } | null => {
            // Dummy validator that always returns an error
            return { error: true };
          },
        }),
        judicialUserField_judicialUserControl: new FormControl(null, Validators.required)
      }),
    });

    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'Organisation',
      type: 'Complex',
      complex_fields: [
        {
          id: 'OrganisationName',
          label: 'Organisation Name',
          display_context: 'MANDATORY',
          field_type: {
            id: 'Text',
            type: 'Text',
          },
        } as CaseField,
      ],
    };

    const CASE_FIELD: CaseField = {
      id: 'OrganisationField',
      label: 'OrganisationField',
      display_context: 'MANDATORY',
      field_type: FIELD_TYPE_WITH_VALUES,
      value: '',
    } as CaseField;

    beforeEach(
      waitForAsync(() => {
        const loadingServiceMock = jasmine.createSpyObj('loadingService', ['register', 'unregister']);
        firstPage.id = 'first page';
        cancelled = createSpyObj('cancelled', ['emit']);

        caseEditComponentStub = {
          form: F_GROUP,
          wizard: WIZARD,
          data: '',
          eventTrigger: {
            case_fields: [],
            name: 'Test event trigger name',
            can_save_draft: false,
          },
          hasPrevious: () => true,
          getPage: () => firstPage,
          first: () => true,
          next: () => true,
          previous: () => true,
          cancel: () => undefined,
          cancelled,
          validate: (caseEventData: CaseEventData) => of(caseEventData),
          saveDraft: (caseEventData: CaseEventData) => draftObservable,
          caseDetails: {
            case_id: '1234567812345678',
            tabs: [],
            metadataFields: [],
          },
          getNextPage: () => null
        };
        snapshot = {
          queryParamMap: createSpyObj('queryParamMap', ['get']),
        };
        route = {
          params: of({ id: 123 }),
          snapshot,
        };
        matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>(
          'MatDialogRef',
          ['afterClosed', 'close']
        );
        dialog = createSpyObj<MatDialog>('dialog', ['open']);
        dialog.open.and.returnValue(matDialogRef);

        spyOn(caseEditComponentStub, 'first');
        spyOn(caseEditComponentStub, 'next');
        spyOn(caseEditComponentStub, 'previous');

        caseEditDataService = {
          caseEventTriggerName$: of('ADD'),
          clearFormValidationErrors: createSpyObj('caseEditDataService', [
            'clearFormValidationErrors',
          ]),
          addFormValidationError: createSpyObj('caseEditDataService', [
            'addFormValidationError',
          ]),
          setCaseLinkError: createSpyObj('caseEditDataService', [
            'setCaseLinkError',
          ]),
          clearCaseLinkError: createSpyObj('caseEditDataService', [
            'clearCaseLinkError',
          ]),
          setCaseEventTriggerName: createSpyObj('caseEditDataService', [
            'setCaseEventTriggerName',
          ]),
          setCaseDetails: createSpyObj('caseEditDataService', [
            'setCaseDetails',
          ]),
          setCaseTitle: createSpyObj('caseEditDataService', [
            'setCaseTitle',
          ]),
          setCaseEditForm: createSpyObj('caseEditDataService', [
            'setCaseEditForm',
          ]),
          caseFormValidationErrors$: new BehaviorSubject<CaseEditValidationError[]>([]),
          caseEditForm$: of(caseEditComponentStub.form),
          caseIsLinkedCasesJourneyAtFinalStep$: of(false),
          caseTriggerSubmitEvent$: of(true)
        };

        TestBed.configureTestingModule({
          declarations: [
            CaseEditPageComponent,
            CaseReferencePipe,
            CcdCaseTitlePipe,
            MockRpxTranslatePipe
          ],
          schemas: [CUSTOM_ELEMENTS_SCHEMA],
          providers: [
            { provide: FormValueService, useValue: formValueService },
            { provide: FormErrorService, useValue: formErrorService },
            { provide: CaseEditComponent, useValue: caseEditComponentStub },
            { provide: PageValidationService, useValue: pageValidationService },
            { provide: ActivatedRoute, useValue: route },
            { provide: MatDialog, useValue: dialog },
            { provide: CaseFieldService, useValue: caseFieldService },
            { provide: CaseEditDataService, useValue: caseEditDataService },
            FieldsUtils,
            PlaceholderService,
            { provide: LoadingService, useValue: loadingServiceMock }
          ],
        }).compileComponents();
      })
    );

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      spyOn(caseEditDataService, 'setCaseEventTriggerName').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseDetails').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseTitle').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseEditForm').and.callFake(() => { });
      spyOn(caseEditDataService, 'setCaseLinkError').and.callThrough();
      spyOn(caseEditDataService, 'addFormValidationError').and.callFake((validationError: CaseEditValidationError) => {
        caseEditDataService.caseFormValidationErrors$.next(
          caseEditDataService.caseFormValidationErrors$.getValue().concat([validationError])
        );
      });
      comp = fixture.componentInstance;
      readOnly.display_context = 'READONLY';
      wizardPage = createWizardPage(
        [createCaseField('field1', 'field1Value')],
        true
      );
      comp.currentPage = wizardPage;
    });

    it('should validate mandatory fields and log error message', () => {
      wizardPage.case_fields.push(
        aCaseField('Invalidfield1', 'Invalidfield1', 'Text', 'MANDATORY', null)
      );
      wizardPage.case_fields.push(
        aCaseField('Invalidfield2', 'Invalidfield2', 'Text', 'MANDATORY', null)
      );
      wizardPage.case_fields.push(CASE_FIELD);
      wizardPage.isMultiColumn = () => false;
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();

      comp.generateErrorMessage(wizardPage.case_fields);
      expect(comp.validationErrors.length).toBe(3);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(`%FIELDLABEL% is required`);
      });
    });

    it('should validate minimum length field value and log error message', () => {
      const caseField = aCaseField(
        'Invalidfield2',
        'Invalidfield2',
        'Text',
        'MANDATORY',
        null
      );
      wizardPage.case_fields.push(caseField);
      wizardPage.isMultiColumn = () => false;
      F_GROUP.setValue({
        data: {
          Invalidfield2: 'test',
          Invalidfield1: 'test1',
          OrganisationField: '',
          complexField1: '',
          FlagLauncherField: null,
          judicialUserField_judicialUserControl: null
        },
      });
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();

      comp.generateErrorMessage(wizardPage.case_fields);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(
          `%FIELDLABEL% is below the minimum length`
        );
      });
    });

    it('should validate maximum length field value and log error message', () => {
      const caseField = aCaseField(
        'Invalidfield2',
        'Invalidfield2',
        'Text',
        'MANDATORY',
        null
      );
      wizardPage.case_fields.push(caseField);
      wizardPage.isMultiColumn = () => false;
      F_GROUP.setValue({
        data: {
          Invalidfield2: 'testing1234',
          Invalidfield1: 'test1',
          OrganisationField: '',
          complexField1: '',
          FlagLauncherField: null,
          judicialUserField_judicialUserControl: null
        },
      });
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();

      comp.generateErrorMessage(wizardPage.case_fields);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(`%FIELDLABEL% exceeds the maximum length`);
      });
    });

    it('should validate mandatory complex type fields and log error message', () => {
      const complexSubField1: CaseField = aCaseField(
        'childField1',
        'childField1',
        'Text',
        'MANDATORY',
        1,
        null,
        true,
        true
      );
      const complexSubField2: CaseField = aCaseField(
        'childField2',
        'childField2',
        'Text',
        'MANDATORY',
        2,
        null,
        false,
        true
      );
      wizardPage.case_fields.push(
        aCaseField(
          'complexField1',
          'complexField1',
          'Complex',
          'MANDATORY',
          1,
          [complexSubField1, complexSubField2],
          true,
          true
        )
      );

      wizardPage.isMultiColumn = () => false;
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();

      comp.generateErrorMessage(wizardPage.case_fields);
      expect(comp.validationErrors.length).toBe(1);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(`%FIELDLABEL% is required`);
      });
    });

    it('should validate FlagLauncher type field and log error message', () => {
      const flagLauncherField: CaseField = aCaseField(
        'FlagLauncherField',
        'flagLauncher',
        'FlagLauncher',
        'MANDATORY',
        1,
        null,
        false,
        true
      );
      // Add dummy functions for isComplex() and isCollection()
      flagLauncherField.isComplex = () => false;
      flagLauncherField.isCollection = () => false;
      // Set DisplayContextParameter to signal "create" mode
      flagLauncherField.display_context_parameter = '#ARGUMENT(CREATE)';
      wizardPage.case_fields.push(flagLauncherField);

      wizardPage.isMultiColumn = () => false;
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();

      comp.generateErrorMessage(wizardPage.case_fields);
      expect(comp.validationErrors.length).toBe(1);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(
          'Please select Next to complete the creation of the case flag'
        );
      });

      // Change DisplayContextParameter to signal "update" mode
      flagLauncherField.display_context_parameter = '#ARGUMENT(UPDATE)';
      comp.validationErrors = [];
      comp.generateErrorMessage(wizardPage.case_fields);
      expect(comp.validationErrors.length).toBe(1);
      comp.validationErrors.forEach((error) => {
        expect(error.message).toEqual(
          'Please select Next to complete the update of the selected case flag'
        );
      });
    });

    it('should validate JudicialUser field and set error message on component', () => {
      // Set up fake component reference on JudicialUser FormControl (required for setting "errors" property)
      F_GROUP.get('data.judicialUserField_judicialUserControl')['component'] = {};
      const judicialUserField = aCaseField(
        'judicialUserField',
        'judicialUser1',
        'JudicialUser',
        'MANDATORY',
        1,
        null,
        false,
        false
      );
      judicialUserField.field_type.type = 'Complex';
      wizardPage.case_fields.push(judicialUserField);
      wizardPage.isMultiColumn = () => false;
      comp.editForm = F_GROUP;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeTruthy();
      comp.generateErrorMessage(wizardPage.case_fields);
      expect(comp.validationErrors.length).toBe(1);
    });
  });

  function createCaseField(
    id: string,
    value: any,
    displayContext = 'READONLY'
  ): CaseField {
    const cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.display_context = displayContext;
    cf.field_type = {
      id: 'Text',
      type: 'Text'
    } as FieldType;
    return cf;
  }

  function createWizardPage(
    fields: CaseField[] = [],
    isMultiColumn = false,
    order = 0
  ): WizardPage {
    const wp: WizardPage = new WizardPage();
    wp.case_fields = fields;
    wp.label = 'Test Label';
    wp.getCol1Fields = () => fields;
    wp.getCol2Fields = () => fields;
    wp.isMultiColumn = () => isMultiColumn;
    wp.order = order;
    return wp;
  }
});
