import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CaseEditPageComponent } from './case-edit-page.component';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { FormValueService } from '../../../services/form/form-value.service';
import { FormErrorService } from '../../../services/form/form-error.service';
import { PageValidationService } from '../services/page-validation.service';
import { SaveOrDiscardDialogComponent } from '../../dialogs/save-or-discard-dialog/save-or-discard-dialog.component';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { aCaseField } from '../../../fixture/shared.test.fixture';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { Draft } from '../../../domain/draft.model';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { FieldTypeSanitiser } from '../../../services/form/field-type-sanitiser';
import { FieldType, FieldTypeEnum } from '../../../domain/definition';
import createSpyObj = jasmine.createSpyObj;
import { WizardPageField } from '../domain';

describe('CaseEditPageComponent', () => {

  let de: DebugElement;
  const $SELECT_SUBMIT_BUTTON = By.css('button[type=submit]');

  let comp: CaseEditPageComponent;
  let fixture: ComponentFixture<CaseEditPageComponent>;
  let wizardPage = new WizardPage();
  let readOnly = new CaseField();
  let fieldTypeSanitiser = new FieldTypeSanitiser();
  let formValueService = new FormValueService(fieldTypeSanitiser);
  let formErrorService = new FormErrorService();
  let firstPage = new WizardPage();
  let caseFieldService = new CaseFieldService();
  let pageValidationService = new PageValidationService(caseFieldService);
  let route: any;
  let snapshot: any;
  const WIZARD = new Wizard([wizardPage]);
  let someObservable = {
    'subscribe': () => new Draft()
  };
  let dialog: any;
  let matDialogRef: any;

  let caseEditComponentStub: any;
  let cancelled: any;
  let caseField1 = new CaseField();
  let caseField2 = new CaseField();
  let eventData = new CaseEventData();

  let getDynamicListJsonValue = (code, label) => {
    return JSON.parse(`{
        "value": {
            "code": "${code}",
            "label":  "${label}"
        },
        "list_items": [
          {
            "code": "List1",
            "label": " List 1"
          },
          {
            "code": "List2",
            "label": " List 2"
          },
          {
            "code": "List3",
            "label": " List 3"
          },
          {
            "code": "List4",
            "label": " List 4"
          },
          {
            "code": "List5",
            "label": " List 5"
          },
          {
            "code": "List6",
            "label": " List 6"
          },
          {
            "code": "List7",
            "label": " List 7"
          }
        ]
    }`);
  }

  let dynamicList = getDynamicListJsonValue('List3', ' List 3');
  let dynamicList2 = getDynamicListJsonValue('List5', ' List 5');
  let formService = {
    filterCurrentPageFields: function (a, b) {
      return pageFormFields;
    },
    sanitise: function () {
      return eventData;
    },
    sanitiseDynamicLists: function () {
      return eventData;
    }
  };
  let pageFormFields = {
    'data': {
      'field1': 'EX12345678',
      'dynamicList': dynamicList,
      'dynamicList2': dynamicList2
    }
  };
  describe('Save and Resume enabled', () => {
    beforeEach(async(() => {
      firstPage.id = 'first page';
      cancelled = createSpyObj('cancelled', ['emit']);
      let formGroup = new FormGroup({
        'data': new FormGroup({'field1': new FormControl('SOME_VALUE')
          , 'dynamicList': new FormControl('List3')
          , 'dynamicList2': new FormControl('List5')})
      });
      caseEditComponentStub = {
        'form': formGroup,
        'wizard': WIZARD,
        'data': '',
        'eventTrigger': {'case_fields': [caseField1], 'name': 'Test event trigger name', 'can_save_draft': true},
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'first': () => true,
        'next': () => true,
        'previous': () => true,
        'cancel': () => undefined,
        'cancelled': cancelled,
        'validate': (caseEventData: CaseEventData) => of(caseEventData),
        'saveDraft': (caseEventData: CaseEventData) => of(someObservable),
        'caseDetails': {'case_id': '1234567812345678', 'tabs': [], 'metadataFields': [caseField2]},
      };
      snapshot = {
        queryParamMap: createSpyObj('queryParamMap', ['get']),
      };
      route = {
        params: of({id: 123}),
        snapshot: snapshot
      };

      matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>('MatDialogRef', ['afterClosed', 'close']);
      dialog = createSpyObj<MatDialog>('dialog', ['open']);
      dialog.open.and.returnValue(matDialogRef);

      spyOn(caseEditComponentStub, 'first');
      spyOn(caseEditComponentStub, 'next');
      spyOn(caseEditComponentStub, 'previous');
      TestBed.configureTestingModule({
        declarations: [CaseEditPageComponent,
          CaseReferencePipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: PageValidationService, useValue: pageValidationService},
          {provide: ActivatedRoute, useValue: route},
          {provide: MatDialog, useValue: dialog}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;
      readOnly.display_context = 'READONLY';
      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')]);
    });

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
      let errorContext = {
        'ignore_warning': true,
        'trigger_text': 'Some error!'
      };
      comp.callbackErrorsNotify(errorContext);
      expect(comp.ignoreWarning).toBeTruthy();
      expect(comp.triggerText).toEqual('Some error!');
    });

    it('should emit RESUMED_FORM_DISCARD on create event if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = false;
      snapshot.queryParamMap.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      fixture.detectChanges();

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    });

    it('should emit NEW_FORM_DISCARD on create case if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = false;
      fixture.detectChanges();

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    });

    it('should emit RESUMED_FORM_DISCARD on create event if discard triggered with value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = true;
      snapshot.queryParamMap.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      matDialogRef.afterClosed.and.returnValue(of('Discard'));
      fixture.detectChanges();

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    });

    it('should emit NEW_FORM_DISCARD on create case if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = true;
      fixture.detectChanges();
      matDialogRef.afterClosed.and.returnValue(of('Discard'));

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    });

    it('should emit RESUMED_FORM_SAVE on create case if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = true;
      snapshot.queryParamMap.get.and.callFake(key => {
        switch (key) {
          case CaseEditComponent.ORIGIN_QUERY_PARAM:
            return 'viewDraft';
        }
      });
      matDialogRef.afterClosed.and.returnValue(of('Save'));
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit)
        .toHaveBeenCalledWith({
          status: CaseEditPageComponent.RESUMED_FORM_SAVE,
          data: {data: {'field1': 'SOME_VALUE', 'dynamicList': 'List3', 'dynamicList2': 'List5'}}
        });
    });

    it('should emit NEW_FORM_SAVE on create case if discard triggered with no value changed', () => {
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      comp.formValuesChanged = true;
      matDialogRef.afterClosed.and.returnValue(of('Save'));
      fixture.detectChanges();

      comp.cancel();
      expect(cancelled.emit).toHaveBeenCalledWith({
        status: CaseEditPageComponent.NEW_FORM_SAVE,
        data: {data: {'field1': 'SOME_VALUE', 'dynamicList': 'List3', 'dynamicList2': 'List5'}}
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
      wizardPage.case_fields.push(aCaseField('fieldX', 'fieldX', 'Text', 'OPTIONAL', null));
      wizardPage.isMultiColumn = () => false;
      comp.currentPage = wizardPage;
      fixture.detectChanges();
      expect(comp.currentPageIsNotValid()).toBeFalsy();
    });

    it('should return "Return to case list" as cancel button text if save and resume enabled for event', () => {
      wizardPage.isMultiColumn = () => true;
      comp.currentPage = wizardPage;
      fixture.detectChanges();

      let cancelText = comp.getCancelText();

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
  });

  describe('Save and Resume disabled', () => {
    beforeEach(async(() => {
      firstPage.id = 'first page';
      cancelled = createSpyObj('cancelled', ['emit']);
      let formGroup = new FormGroup({
        'data': new FormGroup({'field1': new FormControl('SOME_VALUE')
          , 'dynamicList': new FormControl('List3')
          , 'dynamicList2': new FormControl('List5')})
      });
      caseEditComponentStub = {
        'form': formGroup,
        'wizard': WIZARD,
        'data': '',
        'eventTrigger': {'case_fields': [], 'name': 'Test event trigger name', 'can_save_draft': false},
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'first': () => true,
        'next': () => true,
        'previous': () => true,
        'cancel': () => undefined,
        'cancelled': cancelled,
        'validate': (caseEventData: CaseEventData) => of(caseEventData),
        'saveDraft': (caseEventData: CaseEventData) => of(someObservable),
        'caseDetails': {'case_id': '1234567812345678', 'tabs': [], 'metadataFields': []},
      };
      snapshot = {
        queryParamMap: createSpyObj('queryParamMap', ['get']),
      };
      route = {
        params: of({id: 123}),
        snapshot: snapshot
      };

      matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>('MatDialogRef', ['afterClosed', 'close']);
      dialog = createSpyObj<MatDialog>('dialog', ['open']);
      dialog.open.and.returnValue(matDialogRef);

      spyOn(caseEditComponentStub, 'first');
      spyOn(caseEditComponentStub, 'next');
      spyOn(caseEditComponentStub, 'previous');
      TestBed.configureTestingModule({
        declarations: [CaseEditPageComponent,
          CaseReferencePipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: PageValidationService, useValue: pageValidationService},
          {provide: ActivatedRoute, useValue: route},
          {provide: MatDialog, useValue: dialog}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;
      readOnly.display_context = 'READONLY';
      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')], true);
      comp.currentPage = wizardPage;
    });

    it('should return "Cancel" as cancel button text if save and resume not enabled for event', () => {
      fixture.detectChanges();

      let cancelText = comp.getCancelText();

      expect(cancelText).toEqual('Cancel');
    });

    it('should emit cancelled with no event if save and resume not enabled', () => {
      fixture.detectChanges();

      comp.cancel();

      expect(cancelled.emit).toHaveBeenCalled();
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_DISCARD});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.RESUMED_FORM_SAVE});
      expect(cancelled.emit).not.toHaveBeenCalledWith({status: CaseEditPageComponent.NEW_FORM_SAVE});
    });
  });

  describe('updateFormData - should set data', () => {
    let eventTrigger: CaseEventTrigger = {
      'id': 'someId',
      'name': 'Test event trigger name',
      'case_fields': [createCaseField('field1', 'oldValue')],
      'event_token': 'Test event token',
      'can_save_draft': false,
      'wizard_pages': WIZARD.pages,

      hasFields: () => true,
      hasPages: () => true
    };

    let formGroup = new FormGroup({
      'data': new FormGroup({'field1': new FormControl('SOME_VALUE')})
    });

    beforeEach(async(() => {
      firstPage.id = 'first page';

      caseEditComponentStub = {
        'form': formGroup,
        'wizard': WIZARD,
        'data': '',
        'eventTrigger': eventTrigger,
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'first': () => true,
        'next': () => true,
        'previous': () => true,
        'cancel': () => undefined,
        'cancelled': cancelled,
        'validate': (caseEventData: CaseEventData) => of(caseEventData),
        'saveDraft': (caseEventData: CaseEventData) => of(someObservable),
        'caseDetails': {'case_id': '1234567812345678'},
      };

      TestBed.configureTestingModule({
        declarations: [CaseEditPageComponent,
          CaseReferencePipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: FormValueService, useValue: formValueService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: PageValidationService, useValue: pageValidationService},
          {provide: ActivatedRoute, useValue: route},
          {provide: MatDialog, useValue: dialog}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;

      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')]);
      comp.wizard = new Wizard([wizardPage]);
      comp.editForm = formGroup;
    });

    it('should update CaseEventTrigger field value from the MidEvent callback', () => {
      let id = 'field1';
      let updatedValue = 'Updated value';
      const jsonData: CaseEventData = {
        'data': {
          'field1': updatedValue
        },
        'event': {'id': '', 'summary': '', 'description': ''},
        'event_token': '',
        'ignore_warning': true
      };

      comp.updateFormData(jsonData);

      expect(eventTrigger.case_fields.filter(element => element.id === id).pop().value).toBe(updatedValue);
    });
  });

  describe('submit the form', () => {

    let formGroup;

    beforeEach(async(() => {
      formGroup = new FormGroup({
        'data': new FormGroup({'field1': new FormControl('SOME_VALUE')
          , 'dynamicList': new FormControl('List3')
          , 'dynamicList2': new FormControl('List5')})
      });

      cancelled = createSpyObj('cancelled', ['emit']);
      let validateResult = {
        'data': {
          'field1': 'EX12345678',
          'dynamicList': getDynamicListJsonValue('List2', ' List 2'),
          'dynamicList2': getDynamicListJsonValue('List4', ' List 4'),
        },
        'subscribe': function () {
        }
      };

      let dynamicListCaseField = createCaseFieldFieldType('dynamicList', getDynamicListJsonValue('List3', ' List 3'), 'DynamicList');
      let dynamicListCaseField2 = createCaseFieldFieldType('dynamicList2', getDynamicListJsonValue('List5', ' List 5'), 'DynamicList');

      let caseFields: CaseField[] = [createCaseField('field1', 'field1Value'), dynamicListCaseField, dynamicListCaseField2];

      firstPage.id = 'first page';
      firstPage.case_fields = caseFields;

      eventData = new CaseEventData();

      caseEditComponentStub = {
        'form': formGroup,
        'wizard': WIZARD,
        'data': '',
        'eventTrigger': {'case_fields': caseFields, 'name': 'Test event trigger name', 'can_save_draft': true},
        'hasPrevious': () => true,
        'getPage': () => firstPage,
        'first': () => true,
        'next': () => true,
        'previous': () => true,
        'cancel': () => undefined,
        'cancelled': cancelled,
        'validate': (caseEventData: CaseEventData, pageId: string) => of(caseEventData),
        'saveDraft': (caseEventData: CaseEventData) => of(someObservable),
        'caseDetails': {'case_id': '1234567812345678', 'tabs': [], 'metadataFields': [caseField2]},
      };
      snapshot = {
        queryParamMap: createSpyObj('queryParamMap', ['get']),
      };
      route = {
        params: of({id: 123, page: 'some-page'}),
        snapshot: snapshot
      };

      matDialogRef = createSpyObj<MatDialogRef<SaveOrDiscardDialogComponent>>('MatDialogRef', ['afterClosed', 'close']);
      dialog = createSpyObj<MatDialog>('dialog', ['open']);
      dialog.open.and.returnValue(matDialogRef);

      spyOn(caseEditComponentStub, 'first');
      spyOn(caseEditComponentStub, 'next');
      spyOn(caseEditComponentStub, 'previous');
      spyOn(caseEditComponentStub, 'form');
      spyOn(caseEditComponentStub, 'validate').and.returnValue(validateResult);

      spyOn(formService, 'sanitise').and.returnValue(eventData);
      spyOn(formService, 'filterCurrentPageFields').and.returnValue(pageFormFields);

      spyOn(formService, 'sanitiseDynamicLists').and.returnValue(eventData);

      TestBed.configureTestingModule({
        declarations: [CaseEditPageComponent,
          CaseReferencePipe],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          {provide: FormValueService, useValue: formService},
          {provide: FormErrorService, useValue: formErrorService},
          {provide: CaseEditComponent, useValue: caseEditComponentStub},
          {provide: PageValidationService, useValue: pageValidationService},
          {provide: ActivatedRoute, useValue: route},
          {provide: MatDialog, useValue: dialog}
        ]
      }).compileComponents();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(CaseEditPageComponent);
      comp = fixture.componentInstance;

      wizardPage = createWizardPage([createCaseField('field1', 'field1Value')]);
      comp.currentPage = wizardPage;

      de = fixture.debugElement;
      fixture.detectChanges();
    });

    it('should call validate', async () => {

      fixture.detectChanges();

      comp.submit();

      fixture.whenStable().then(() => {
        expect(caseEditComponentStub.validate).toHaveBeenCalledWith(eventData, firstPage.id);
      });
    });

    it('should call sanitize dynamic lists on page and event form fields', async () => {

      fixture.detectChanges();

      comp.submit();

      console.log('caseEditComponentStub.eventTrigger.case_fields=' + caseEditComponentStub.eventTrigger.case_fields);
      console.log('comp.editForm.value=' + comp.editForm.value);
      console.log('firstPage.case_fields=' + firstPage.case_fields);
      console.log('formGroup.value=' + formGroup.value);

      fixture.whenStable().then(() => {
        expect(formService.sanitiseDynamicLists).toHaveBeenCalledWith(caseEditComponentStub.eventTrigger.case_fields, comp.editForm.value);
        expect(formService.sanitiseDynamicLists).toHaveBeenCalledWith(firstPage.case_fields, formGroup.value);
      });
    });

    fit('should set event data', async () => {

      fixture.detectChanges();

      expect(eventData.case_reference).toBeUndefined();
      expect(eventData.event_data).toBeUndefined();
      expect(formGroup.value.data['dynamicList']).toEqual('List3');
      expect(formGroup.value.data['dynamicList2']).toEqual('List5');

      comp.submit();

      fixture.whenStable().then(() => {
        expect(eventData.case_reference).toEqual(caseEditComponentStub.caseDetails.case_id);
        expect(eventData.event_data['field1']).toEqual('EX12345678');
        expect(eventData.event_data['dynamicList']).toEqual(getDynamicListJsonValue('List3', ' List 3'));
        expect(eventData.event_data['dynamicList2']).toEqual(getDynamicListJsonValue('List5', ' List 5'));
        expect(eventData.ignore_warning).toEqual(comp.ignoreWarning);
        expect(eventData.event_token).toEqual(comp.eventTrigger.event_token);
      });
    });

    it('should change button label when callback warnings notified ', () => {
      let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
      callbackErrorsContext.trigger_text = CaseEditPageComponent.TRIGGER_TEXT_START;
      comp.callbackErrorsNotify(callbackErrorsContext);

      fixture.detectChanges();
      let button = de.query($SELECT_SUBMIT_BUTTON);
      expect(button.nativeElement.textContent).toEqual(CaseEditPageComponent.TRIGGER_TEXT_START);
      expect(comp.ignoreWarning).toBeFalsy();

      callbackErrorsContext.ignore_warning = true;
      callbackErrorsContext.trigger_text = CaseEditPageComponent.TRIGGER_TEXT_CONTINUE;
      comp.callbackErrorsNotify(callbackErrorsContext);

      fixture.detectChanges();
      expect(button.nativeElement.textContent).toEqual(CaseEditPageComponent.TRIGGER_TEXT_CONTINUE);
      expect(comp.ignoreWarning).toBeTruthy();
    });
  });

  function createCaseField(id: string, value: any, display_context = 'READONLY'): CaseField {
    let cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.display_context = display_context;
    let wizardProps = new WizardPageField();
    wizardProps.page_column_no = 1;
    cf.wizardProps = wizardProps;
    return cf;
  }

  function createCaseFieldFieldType(id: string, value: any, fieldTypeEnum: FieldTypeEnum, display_context = 'READONLY'): CaseField {
    let cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.list_items = [{
      'code': 'List1',
      'label': ' List 1'
    }, {
      'code': 'List2',
      'label': ' List 2'
    }, {
      'code': 'List3',
      'label': ' List 3'
    }, {
      'code': 'List4',
      'label': ' List 4'
    }, {
      'code': 'List5',
      'label': ' List 5'
    }, {
      'code': 'List6',
      'label': ' List 6'
    }, {
      'code': 'List7',
      'label': ' List 7'
    }];
    cf.display_context = display_context;
    let fieldType = new FieldType();
    fieldType.type = fieldTypeEnum;
    cf.field_type = fieldType;
    let wizardProps = new WizardPageField();
    wizardProps.page_column_no = 1;
    cf.wizardProps = wizardProps;
    return cf;
  }

  function createWizardPage(fields: CaseField[], isMultiColumn = false): WizardPage {
    let wp: WizardPage = new WizardPage();
    wp.case_fields = fields;
    wp.label = 'Test Label';
    wp.getCol1Fields = () => fields;
    wp.getCol2Fields = () => fields;
    wp.isMultiColumn = () => isMultiColumn;
    return wp;
  }
});
