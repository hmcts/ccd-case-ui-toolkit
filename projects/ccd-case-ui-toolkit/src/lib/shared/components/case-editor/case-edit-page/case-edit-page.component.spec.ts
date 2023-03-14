import { ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { CaseEventData, CaseEventTrigger } from '../../../domain';
import { CaseFieldService, FormErrorService, FormValueService } from '../../../services';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';
import { PageValidationService } from '../services';
import { CaseEditPageComponent } from './case-edit-page.component';
import { CallbackErrorsContext } from '../../error';

import * as _ from 'lodash';

describe('CaseEditPageComponent', () => {
  let component: CaseEditPageComponent;

  const mockCaseEditDataService = {
    caseEditForm$: of({
      value: '',
      controls: {
        data: ''
      }
    }),
    caseFormValidationErrors$: of(null),
    caseTriggerSubmitEvent$: of(false),
    setCaseDetails: () => {},
    setCaseEventTriggerName: () => {},
    setCaseTitle: () => {},
    setCaseEditForm: () => {},
    setTriggerSubmitEvent: () => {},
    clearFormValidationErrors: () => {},
    addFormValidationError: () => {},
  };
  const mockRoute = {
    params: of({page: 1})
  };

  const mockFormValueService = jasmine.createSpyObj('FormValueService', [
    'sanitise', 'filterCurrentPageFields', 'sanitiseDynamicLists', 'removeUnnecessaryFields'
  ]);

  const mockFormErrorService = jasmine.createSpyObj('FormErrorService', [
    'mapFieldErrors'
  ]);

  const mockCaseEdit = {
    isSubmitting: false,
    error: null,
    wizard: {} as unknown as Wizard,
    ignoreWarning: null,
    caseDetails: null,
    onEventCanBeCompleted: () => {},
    eventTrigger: {
      name: 'sampleName',
      event_token: 'sampleToken',
      case_id: 'testId',
      can_save_draft: false,
      show_summary: false,
      end_button_label: 'end button label',
      case_fields: [
        {
          order: 1,
          id: '1'
        }
      ]
    } as unknown as CaseEventTrigger,
    getPage: () => {},
    first: () => new Promise((resolve, reject) => resolve(true)),
    previous: () => new Promise((resolve, reject) => resolve(true)),
    next: () => new Promise((resolve, reject) => resolve(true)),
    getNextPage: () => {},
    hasPrevious: () => {},
    saveDraft: () => {},
    callbackErrorsSubject: {
      next: () => {}
    },
    validate: () => {},
    form: {
      value: { total: '1'},
      controls: {
        data: ''
      }
    } as unknown as FormGroup,
    cancelled: {
      emit: () => {},
    },
    submitted: {
      emit: () => {},
    },
  }

  const mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', [
    'detectChanges'
  ]);
  const mockPageValidationService = jasmine.createSpyObj('PageValidationService', [
    'isPageValid'
  ]);

  const initializeComponent = ({
    caseEdit = {},
    route = {},
    formValueService = {},
    formErrorService = {},
    cdRef = {},
    pageValidationService = {},
    dialog = {},
    caseFieldService = {},
    caseEditDataService = {},
  }) => new CaseEditPageComponent(
    caseEdit as CaseEditComponent,
    route as ActivatedRoute,
    formValueService as FormValueService,
    formErrorService as FormErrorService,
    cdRef as ChangeDetectorRef,
    pageValidationService as PageValidationService,
    dialog as MatDialog,
    caseFieldService as CaseFieldService,
    caseEditDataService as CaseEditDataService
  );

  it('should create', () => {
    component = initializeComponent({});

    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it(`should update 'eventTrigger', 'currentpage' and 'triggerText' as a page is present`, () => {
      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditDataService,
        formValueService: mockFormValueService
      });
      spyOn(mockCaseEdit, 'getNextPage').and.returnValue({});
      spyOn(mockCaseEdit, 'getPage').and.returnValue({ id: 'sampleId' });
      spyOn(mockCaseEdit, 'hasPrevious').and.returnValue(true);

      component.ngOnInit();

      expect(component.eventTrigger.show_summary).toEqual(mockCaseEdit.eventTrigger.show_summary);
      expect(component.currentPage.id).toEqual('sampleId');
      expect(component.triggerText).toEqual(CaseEditPageComponent.TRIGGER_TEXT_START);
    });

    it(`should NOT update 'currentpage' as a page is NOT present`, () => {
      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditDataService,
        formValueService: mockFormValueService
      });

      spyOn(mockCaseEdit, 'hasPrevious').and.returnValue(true);
      spyOn(mockCaseEdit, 'first');

      component.ngOnInit();

      expect(component.triggerText).toEqual('Submit');
      expect(mockCaseEdit.first).toHaveBeenCalled();
    });

    it(`should NOT update 'currentpage' as a page is NOT present. However, currentPage is present`, () => {
      const mockCaseEditCanSaveDraft = _.cloneDeep(mockCaseEdit);
      mockCaseEditCanSaveDraft.eventTrigger.can_save_draft = true;
      component = initializeComponent({
        caseEdit: mockCaseEditCanSaveDraft,
        route: mockRoute,
        caseEditDataService: mockCaseEditDataService,
        formValueService: mockFormValueService
      });

      component.currentPage = { id: 'sampleId' } as unknown as WizardPage;

      spyOn(mockCaseEditCanSaveDraft, 'hasPrevious').and.returnValue(true);
      spyOn(mockCaseEditCanSaveDraft, 'next');
      spyOn(mockCaseEditCanSaveDraft.callbackErrorsSubject, 'next');

      component.ngOnInit();

      expect(mockCaseEditCanSaveDraft.next).toHaveBeenCalled();
      expect(mockCaseEditCanSaveDraft.callbackErrorsSubject.next).toHaveBeenCalled();
    });

    it(`should submit as caseTriggerSubmitEvent's state is present when current page is NOT valid`, () => {
      const mockCaseEditData = _.cloneDeep(mockCaseEditDataService);

      mockCaseEditData.caseTriggerSubmitEvent$ = of(true);

      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditData,
        formValueService: mockFormValueService
      });
      spyOn(mockCaseEdit, 'getNextPage').and.returnValue({});
      spyOn(mockCaseEdit, 'getPage').and.returnValue({ id: 'sampleId' });
      spyOn(mockCaseEdit, 'hasPrevious').and.returnValue(true);
      spyOn(mockCaseEditData, 'setTriggerSubmitEvent');
      spyOn(mockCaseEditData, 'clearFormValidationErrors');
      spyOn(component, 'currentPageIsNotValid').and.returnValue(true);
      spyOn(component, 'generateErrorMessage');

      component.ngOnInit();

      expect(mockCaseEditData.setTriggerSubmitEvent).toHaveBeenCalledWith(false);
      expect(mockCaseEditData.clearFormValidationErrors).toHaveBeenCalled();
      expect(component.generateErrorMessage).toHaveBeenCalled();
    });

    it(`should submit as caseTriggerSubmitEvent's state is present when current page is valid`, () => {
      const mockCaseEditData = _.cloneDeep(mockCaseEditDataService);

      mockCaseEditData.caseTriggerSubmitEvent$ = of(true);

      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditData,
        formValueService: mockFormValueService
      });
      spyOn(mockCaseEdit, 'getNextPage').and.returnValue({});
      spyOn(mockCaseEdit, 'getPage').and.returnValue({
        id: 'sampleId',
        case_fields: [
          {
            order: 1,
            id: '1'
          }
        ]
      });
      spyOn(mockCaseEdit, 'hasPrevious').and.returnValue(true);
      spyOn(mockCaseEdit, 'validate').and.returnValue(true).and.returnValue(of({}));
      spyOn(mockCaseEditData, 'setTriggerSubmitEvent');
      spyOn(mockCaseEditData, 'clearFormValidationErrors');
      spyOn(component, 'currentPageIsNotValid').and.returnValue(false);
      spyOn(component, 'generateErrorMessage');

      spyOn(component, 'buildCaseEventData');
      spyOn(component, 'updateFormData');

      component.ngOnInit();

      expect(mockCaseEditData.setTriggerSubmitEvent).toHaveBeenCalledWith(false);
      expect(mockCaseEditData.clearFormValidationErrors).toHaveBeenCalled();
      expect(mockCaseEdit.error).toEqual(null);
      expect(component.generateErrorMessage).not.toHaveBeenCalled();
      expect(component.buildCaseEventData).toHaveBeenCalled();
      expect(component.updateFormData).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it(`should error due 'validate' error`, () => {
      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditDataService,
        formValueService: mockFormValueService,
        formErrorService: mockFormErrorService
      });
      component.currentPage = { id: 'id'} as unknown as WizardPage;
      spyOn(mockCaseEditDataService, 'clearFormValidationErrors');
      spyOn(mockCaseEdit, 'validate').and.returnValue(true).and.returnValue(throwError(({ details: 'details' } as unknown as string)));
      spyOn(component, 'currentPageIsNotValid').and.returnValue(false);
      spyOn(component, 'generateErrorMessage');

      spyOn(component, 'buildCaseEventData');
      spyOn(component, 'updateFormData');

      component.submit();

      expect(component.generateErrorMessage).not.toHaveBeenCalled();
      expect(component.updateFormData).not.toHaveBeenCalled();
      expect(component.buildCaseEventData).toHaveBeenCalled();
      expect(mockFormErrorService.mapFieldErrors).toHaveBeenCalled();
    });
  });

  describe('onEventCanBeCompleted', () => {
    it(`should call caseEdit's 'onEventCanBeCompleted'`, () => {
      component = initializeComponent({
        caseEdit: mockCaseEdit,
        route: mockRoute,
        caseEditDataService: mockCaseEditDataService,
        formValueService: mockFormValueService,
        formErrorService: mockFormErrorService
      });
      component.currentPage = { id: 'id'} as unknown as WizardPage;
      spyOn(mockCaseEdit, 'onEventCanBeCompleted');

      component.onEventCanBeCompleted(true);

      expect(mockCaseEdit.onEventCanBeCompleted).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewChecked', () => {
    it(`should call cdRef's 'detectChanges'`, () => {
      component = initializeComponent({
        cdRef: mockChangeDetectorRef,
      });

      component.ngAfterViewChecked();

      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });
  });

  describe('applyValuesChanged', () => {
    it(`should update 'formValuesChanged'`, () => {
      component = initializeComponent({});

      component.applyValuesChanged(false);
      expect(component.formValuesChanged).toEqual(false);

      component.applyValuesChanged(true);
      expect(component.formValuesChanged).toEqual(true);
    });
  });

  describe('currentPageIsNotValid', () => {
    it(`should call pageValidationService's 'isPageValid'`, () => {
      component = initializeComponent({pageValidationService: mockPageValidationService});

      component.currentPageIsNotValid();

      expect(mockPageValidationService.isPageValid).toHaveBeenCalled();
    });
  });

  describe('toPreviousPage', () => {
    it(`should update 'formValuesChanged'`, () => {
      component = initializeComponent({caseEditDataService: mockCaseEditDataService});

      spyOn(mockCaseEditDataService, 'clearFormValidationErrors');
      spyOn(component, 'buildCaseEventData').and.returnValue({event_data: 'event_data'});
      spyOn(component, 'updateFormData');
      spyOn(component, 'previous');

      component.toPreviousPage();

      expect(mockCaseEditDataService.clearFormValidationErrors).toHaveBeenCalled();
      expect(component.updateFormData).toHaveBeenCalled();
      expect(component.previous).toHaveBeenCalled();
    });
  });

  describe('navigateToErrorElement', () => {
    it(`should scroll to element`, () => {
      const mockDoc = jasmine.createSpyObj('document.getElementById', [
        'scrollIntoView', 'focus',
      ]);
      component = initializeComponent({});
      spyOn(document, 'getElementById').and.returnValue(mockDoc);

      component.navigateToErrorElement('id');

      expect(document.getElementById('').scrollIntoView).toHaveBeenCalled();
      expect(document.getElementById('').focus).toHaveBeenCalled();
    });
  });

  describe('pageWithFieldExists', () => {
    it(`should call wizard's findWizardPage`, () => {
      const mockDoc = jasmine.createSpyObj('document.getElementById', [
        'scrollIntoView', 'focus',
      ]);
      component = initializeComponent({});

      component.wizard = jasmine.createSpyObj('wizard', [
        'findWizardPage',
      ]);

      component.pageWithFieldExists('id');

      expect(component.wizard.findWizardPage).toHaveBeenCalled();
    });
  });

  describe('callbackErrorsNotify', () => {
    it(`should update ignoreWarning and triggerText`, () => {
      const errorContext = {
        ignore_warning: 'warning',
        trigger_text: 'trigger text'
      } as unknown as CallbackErrorsContext;
      component = initializeComponent({
        caseEdit: mockCaseEdit,
      });

      component.callbackErrorsNotify(errorContext);

      expect(component.triggerText).toEqual(errorContext.trigger_text);
      expect(mockCaseEdit.ignoreWarning).toEqual(errorContext.ignore_warning);
    });
  });

  describe('getCancelText', () => {
    it(`should return text`, () => {
      component = initializeComponent({});

      component.eventTrigger = {
        can_save_draft: false
      } as unknown as CaseEventTrigger;

      const actualFalse = component.getCancelText()

      expect(actualFalse).toEqual('Cancel');

      component.eventTrigger = {
        can_save_draft: true
      } as unknown as CaseEventTrigger;

      const actualTrue = component.getCancelText()

      expect(actualTrue).toEqual('Return to case list');
    });
  });

  describe('getCaseTitle', () => {
    it(`should return text`, () => {
      const mockCaseEditDisplayTitle = _.cloneDeep(mockCaseEdit);

      mockCaseEditDisplayTitle.caseDetails = {
        state: {
          title_display: 'title display'
        }
      }

      component = initializeComponent({ caseEdit: mockCaseEditDisplayTitle });

      const actual = component.getCaseTitle()

      expect(actual).toEqual('title display');
    });
  });

  describe('submitting', () => {
    it(`should return boolean`, () => {

      component = initializeComponent({ caseEdit: mockCaseEdit });

      const actual = component.submitting()

      expect(actual).toEqual(false);
    });
  });

  describe('hasPrevious', () => {
    it(`should return boolean`, () => {
      component = initializeComponent({ caseEdit: mockCaseEdit });
      component.currentPage = { id: 'sampleid' } as unknown as WizardPage;
      spyOn(mockCaseEdit, 'hasPrevious').and.returnValue(false);

      const actual = component.hasPrevious();

      expect(actual).toEqual(false);
    });
  });

  describe('previous', () => {
    const mockFormValueServiceCustom = {
      sanitise: () => {},
    }
    it(`should call caseEdit's 'previous'`, () => {
      component = initializeComponent({ caseEdit: mockCaseEdit, formValueService: mockFormValueServiceCustom });
      component.currentPage = { id: 'sampleid' } as unknown as WizardPage;
      component.editForm = mockCaseEdit.form;
      component.eventTrigger = {
        ...mockCaseEdit.eventTrigger,
        can_save_draft: true,
        event_token: 'event_token'
      } as unknown as CaseEventTrigger;
      spyOn(mockFormValueServiceCustom, 'sanitise').and.returnValue({event_token: null, ignore_warning: null});
      spyOn(mockCaseEdit, 'saveDraft').and.returnValue(of({id: 'id'}));
      spyOn(mockCaseEdit, 'previous');

      component.previous();

      expect(mockCaseEdit.ignoreWarning).toEqual(false);
      expect(mockCaseEdit.previous).toHaveBeenCalled();
      expect(component.eventTrigger.case_id).toEqual('DRAFTid');
    });

    it(`should call formValueService's 'mapFieldErrors'`, () => {
      component = initializeComponent({ caseEdit: mockCaseEdit, formValueService: mockFormValueServiceCustom, formErrorService: mockFormErrorService });
      component.currentPage = { id: 'sampleid' } as unknown as WizardPage;
      component.editForm = mockCaseEdit.form;
      component.eventTrigger = {
        ...mockCaseEdit.eventTrigger,
        can_save_draft: true,
        event_token: 'event_token'
      } as unknown as CaseEventTrigger;
      spyOn(mockFormValueServiceCustom, 'sanitise').and.returnValue({event_token: null, ignore_warning: null});
      spyOn(mockCaseEdit, 'saveDraft').and.returnValue(throwError(({ details: 'details' } as unknown as string)));
      spyOn(mockCaseEdit, 'previous');

      component.previous();

      expect(mockFormErrorService.mapFieldErrors).toHaveBeenCalled();
    });
  });

  describe('getCaseId', () => {
    it(`should return case id`, () => {
      const mockCaseEditCaseId = _.cloneDeep(mockCaseEdit);

      mockCaseEditCaseId.caseDetails = {
        case_id: 'case'
      }

      component = initializeComponent({ caseEdit: mockCaseEditCaseId });

      const actual = component.getCaseId()

      expect(actual).toEqual('case');
    });

    it(`should NOT return case id as no caseDetails present`, () => {
      const mockCaseEditNoCaseId = _.cloneDeep(mockCaseEdit);
      mockCaseEditNoCaseId.caseDetails = null

      component = initializeComponent({ caseEdit: mockCaseEditNoCaseId });

      const actual = component.getCaseId()

      expect(actual).toEqual('');
    });
  });

  describe('updateFormData', () => {
    it(`should update Form Data`, () => {
      const jsonData = {
        data: {
          CaseNote1: {
            Note: 'nice one 26',
            Date: '2023-10-01',
            Author: null,
          },
        },
        _links: {
          self: {
            href: 'http://gateway-ccd.demo.platform.hmcts.net/case-types/CaseViewWithNoSummary/validate?pageId=updateCaseNoteSingleFormPage',
          },
        },
      } as unknown as CaseEventData;

      const eventTrigger = {
        id: 'updateCaseNote',
        name: 'Update Case Note',
        description: 'Update Case Note (Complex field)',
        case_id: '1111',
        case_fields: [
          {
            id: 'CaseNote1',
            label: 'Case note',
            hidden: null,
            _value: { Date: '2023-10-01', Note: 'nice one 26', Author: null },
            metadata: false,
            hint_text:
              'Hidden if Hide all is entered in Text Field 0; value will be retained',
            field_type: {
              id: 'CaseNote',
              type: 'Complex',
              min: null,
              max: null,
              regular_expression: null,
              fixed_list_items: [],
              complex_fields: [
                {
                  id: 'Note',
                  label: 'Note',
                  hidden: false,
                  order: null,
                  metadata: false,
                  case_type_id: null,
                  hint_text: null,
                  field_type: {
                    id: 'TextArea',
                    type: 'TextArea',
                    min: null,
                    max: null,
                    regular_expression: null,
                    fixed_list_items: [],
                    complex_fields: [],
                    collection_field_type: null,
                  },
                  security_classification: 'PUBLIC',
                  live_from: null,
                  live_until: null,
                  show_condition: null,
                  acls: [
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-solicitor',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-superuser',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-caa',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'pui-caa',
                    },
                  ],
                  complexACLs: [],
                  display_context: 'OPTIONAL',
                  display_context_parameter: null,
                  retain_hidden_value: null,
                  formatted_value: null,
                  category_id: null,
                },
                {
                  id: 'Date',
                  label: 'Date',
                  hidden: false,
                  order: null,
                  metadata: false,
                  case_type_id: null,
                  hint_text: null,
                  field_type: {
                    id: 'Date',
                    type: 'Date',
                    min: null,
                    max: null,
                    regular_expression: null,
                    fixed_list_items: [],
                    complex_fields: [],
                    collection_field_type: null,
                  },
                  security_classification: 'PUBLIC',
                  live_from: null,
                  live_until: null,
                  show_condition: null,
                  acls: [
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-solicitor',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-superuser',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-caa',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'pui-caa',
                    },
                  ],
                  complexACLs: [],
                  display_context: 'OPTIONAL',
                  display_context_parameter: null,
                  retain_hidden_value: null,
                  formatted_value: null,
                  category_id: null,
                },
                {
                  id: 'Author',
                  label: 'Author',
                  hidden: false,
                  order: null,
                  metadata: false,
                  case_type_id: null,
                  hint_text: null,
                  field_type: {
                    id: 'Text',
                    type: 'Text',
                    min: null,
                    max: null,
                    regular_expression: null,
                    fixed_list_items: [],
                    complex_fields: [],
                    collection_field_type: null,
                  },
                  security_classification: 'PUBLIC',
                  live_from: null,
                  live_until: null,
                  show_condition: null,
                  acls: [
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-solicitor',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-divorce-superuser',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'caseworker-caa',
                    },
                    {
                      create: true,
                      read: true,
                      update: true,
                      delete: true,
                      role: 'pui-caa',
                    },
                  ],
                  complexACLs: [],
                  display_context: 'READONLY',
                  display_context_parameter: null,
                  retain_hidden_value: null,
                  formatted_value: null,
                  category_id: null,
                },
              ],
              collection_field_type: null,
            },
            validation_expr: null,
            security_label: 'PUBLIC',
            order: 21,
            formatted_value: {
              Date: '2023-10-01',
              Note: 'nice one 26',
              Author: null,
            },
            display_context: 'COMPLEX',
            display_context_parameter: null,
            show_condition: null,
            show_summary_change_option: true,
            show_summary_content_option: null,
            retain_hidden_value: null,
            publish: false,
            publish_as: null,
            acls: [
              {
                create: true,
                read: true,
                update: true,
                delete: true,
                role: 'caseworker-divorce-solicitor',
              },
              {
                create: true,
                read: true,
                update: true,
                delete: true,
                role: 'caseworker-divorce-superuser',
              },
              {
                create: true,
                read: true,
                update: true,
                delete: true,
                role: 'caseworker-caa',
              },
              {
                create: true,
                read: true,
                update: true,
                delete: true,
                role: 'pui-caa',
              },
            ],
            wizardProps: {
              case_field_id: 'CaseNote1',
              order: 21,
              page_column_no: null,
              complex_field_overrides: [
                {
                  complex_field_element_id: 'CaseNote1.Note',
                  display_context: 'OPTIONAL',
                  label: null,
                  hint_text: null,
                  show_condition: null,
                  retain_hidden_value: null,
                },
                {
                  complex_field_element_id: 'CaseNote1.Date',
                  display_context: 'OPTIONAL',
                  label: null,
                  hint_text: null,
                  show_condition: null,
                  retain_hidden_value: null,
                },
                {
                  complex_field_element_id: 'CaseNote1.Author',
                  display_context: 'READONLY',
                  label: null,
                  hint_text: null,
                  show_condition: null,
                  retain_hidden_value: null,
                },
              ],
            },
          },
        ],
        event_token:
          'eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJraDFhNmwxcW02ZXI1Y2g3OGNvNzZhY241dSIsInN1YiI6IjJmZWFmNWExLTcwOGEtNGEwNy05MTMwLTJhNGQxMDQ5MzA2NCIsImlhdCI6MTY3ODc4OTIzMCwiY2FzZS1pZCI6IjIyMTQzNyIsImV2ZW50LWlkIjoidXBkYXRlQ2FzZU5vdGUiLCJjYXNlLXR5cGUtaWQiOiJDYXNlVmlld1dpdGhOb1N1bW1hcnkiLCJqdXJpc2RpY3Rpb24taWQiOiJESVZPUkNFIiwiY2FzZS1zdGF0ZSI6IkNhc2VOb3RlVXBkYXRlZCIsImNhc2UtdmVyc2lvbiI6IjhiODg3OWQzYWU2ODEyZWMyY2E2ZTQ4YTJiNzMzZTNjMzcwYjU1YTIwOGY3MzZlMTYwZWYzMDQxYTcxZjliY2EiLCJlbnRpdHktdmVyc2lvbiI6NTl9.SxysIG-dlXYE8gWHqOmdYA22A8iQf-eZ-eC-iAC_6I4',
        wizard_pages: [
          {
            id: 'updateCaseNoteSingleFormPage',
            label: 'The data on this page will appear in various tabs',
            order: 1,
            wizard_page_fields: [
              {
                case_field_id: 'CaseNote1',
                order: 21,
                page_column_no: null,
                complex_field_overrides: [
                  {
                    complex_field_element_id: 'CaseNote1.Note',
                    display_context: 'OPTIONAL',
                    label: null,
                    hint_text: null,
                    show_condition: null,
                    retain_hidden_value: null,
                  },
                  {
                    complex_field_element_id: 'CaseNote1.Date',
                    display_context: 'OPTIONAL',
                    label: null,
                    hint_text: null,
                    show_condition: null,
                    retain_hidden_value: null,
                  },
                  {
                    complex_field_element_id: 'CaseNote1.Author',
                    display_context: 'READONLY',
                    label: null,
                    hint_text: null,
                    show_condition: null,
                    retain_hidden_value: null,
                  },
                ],
              },
            ],
            show_condition: null,
            callback_url_mid_event: null,
            retries_timeout_mid_event: [],
            parsedShowCondition: { condition: null, conditions: [] },
            case_fields: [
              {
                id: 'CaseNote1',
                label: 'Case note',
                hidden: null,
                _value: {
                  Date: '2023-10-01',
                  Note: 'nice one 26',
                  Author: null,
                },
                metadata: false,
                hint_text:
                  'Hidden if Hide all is entered in Text Field 0; value will be retained',
                field_type: {
                  id: 'CaseNote',
                  type: 'Complex',
                  min: null,
                  max: null,
                  regular_expression: null,
                  fixed_list_items: [],
                  complex_fields: [
                    {
                      id: 'Note',
                      label: 'Note',
                      hidden: false,
                      order: null,
                      metadata: false,
                      case_type_id: null,
                      hint_text: null,
                      field_type: {
                        id: 'TextArea',
                        type: 'TextArea',
                        min: null,
                        max: null,
                        regular_expression: null,
                        fixed_list_items: [],
                        complex_fields: [],
                        collection_field_type: null,
                      },
                      security_classification: 'PUBLIC',
                      live_from: null,
                      live_until: null,
                      show_condition: null,
                      acls: [
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-solicitor',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-superuser',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-caa',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'pui-caa',
                        },
                      ],
                      complexACLs: [],
                      display_context: 'OPTIONAL',
                      display_context_parameter: null,
                      retain_hidden_value: null,
                      formatted_value: null,
                      category_id: null,
                    },
                    {
                      id: 'Date',
                      label: 'Date',
                      hidden: false,
                      order: null,
                      metadata: false,
                      case_type_id: null,
                      hint_text: null,
                      field_type: {
                        id: 'Date',
                        type: 'Date',
                        min: null,
                        max: null,
                        regular_expression: null,
                        fixed_list_items: [],
                        complex_fields: [],
                        collection_field_type: null,
                      },
                      security_classification: 'PUBLIC',
                      live_from: null,
                      live_until: null,
                      show_condition: null,
                      acls: [
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-solicitor',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-superuser',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-caa',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'pui-caa',
                        },
                      ],
                      complexACLs: [],
                      display_context: 'OPTIONAL',
                      display_context_parameter: null,
                      retain_hidden_value: null,
                      formatted_value: null,
                      category_id: null,
                    },
                    {
                      id: 'Author',
                      label: 'Author',
                      hidden: false,
                      order: null,
                      metadata: false,
                      case_type_id: null,
                      hint_text: null,
                      field_type: {
                        id: 'Text',
                        type: 'Text',
                        min: null,
                        max: null,
                        regular_expression: null,
                        fixed_list_items: [],
                        complex_fields: [],
                        collection_field_type: null,
                      },
                      security_classification: 'PUBLIC',
                      live_from: null,
                      live_until: null,
                      show_condition: null,
                      acls: [
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-solicitor',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-divorce-superuser',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'caseworker-caa',
                        },
                        {
                          create: true,
                          read: true,
                          update: true,
                          delete: true,
                          role: 'pui-caa',
                        },
                      ],
                      complexACLs: [],
                      display_context: 'READONLY',
                      display_context_parameter: null,
                      retain_hidden_value: null,
                      formatted_value: null,
                      category_id: null,
                    },
                  ],
                  collection_field_type: null,
                },
                validation_expr: null,
                security_label: 'PUBLIC',
                order: 21,
                formatted_value: {
                  Date: '2023-10-01',
                  Note: 'nice one 26',
                  Author: null,
                },
                display_context: 'COMPLEX',
                display_context_parameter: null,
                show_condition: null,
                show_summary_change_option: true,
                show_summary_content_option: null,
                retain_hidden_value: null,
                publish: false,
                publish_as: null,
                acls: [
                  {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    role: 'caseworker-divorce-solicitor',
                  },
                  {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    role: 'caseworker-divorce-superuser',
                  },
                  {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    role: 'caseworker-caa',
                  },
                  {
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    role: 'pui-caa',
                  },
                ],
                wizardProps: {
                  case_field_id: 'CaseNote1',
                  order: 21,
                  page_column_no: null,
                  complex_field_overrides: [
                    {
                      complex_field_element_id: 'CaseNote1.Note',
                      display_context: 'OPTIONAL',
                      label: null,
                      hint_text: null,
                      show_condition: null,
                      retain_hidden_value: null,
                    },
                    {
                      complex_field_element_id: 'CaseNote1.Date',
                      display_context: 'OPTIONAL',
                      label: null,
                      hint_text: null,
                      show_condition: null,
                      retain_hidden_value: null,
                    },
                    {
                      complex_field_element_id: 'CaseNote1.Author',
                      display_context: 'READONLY',
                      label: null,
                      hint_text: null,
                      show_condition: null,
                      retain_hidden_value: null,
                    },
                  ],
                },
              },
            ],
          },
        ],
        show_summary: false,
        show_event_notes: false,
        end_button_label: null,
        can_save_draft: null,
        access_granted: 'SPECIFIC',
        access_process: 'NONE',
        title_display: null,
        supplementary_data: null,
        _links: {
          self: {
            href: 'http://gateway-ccd.demo.platform.hmcts.net/internal/cases/1111/event-triggers/updateCaseNote?ignore-warning=false',
          },
        },
      } as unknown as CaseEventTrigger;

      const mockCaseEditCaseEventTrigger = _.cloneDeep(mockCaseEdit);
      mockCaseEditCaseEventTrigger.eventTrigger = eventTrigger;
      component = initializeComponent({
        caseEdit: mockCaseEditCaseEventTrigger,
      });

      spyOn(component, 'pageWithFieldExists').and.returnValue({name: 'wizard'});
      spyOn(component, 'updateFormControlsValue');

      component.updateFormData(jsonData);

      expect(component.updateFormControlsValue).toHaveBeenCalled();
    });
  });

});
