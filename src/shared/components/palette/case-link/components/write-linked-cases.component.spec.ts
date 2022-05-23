import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseEventData } from '../../../../domain/case-event-data.model';
import { CaseField } from '../../../../domain/definition/case-field.model';
import { Draft } from '../../../../domain/draft.model';
import { CaseFieldService } from '../../../../services/case-fields/case-field.service';
import { FieldTypeSanitiser } from '../../../../services/form/field-type-sanitiser';
import { FormErrorService } from '../../../../services/form/form-error.service';
import { FormValueService } from '../../../../services/form/form-value.service';
import { CaseEditPageComponent } from '../../../case-editor/case-edit-page/case-edit-page.component';
import { WizardPage } from '../../../case-editor/domain/wizard-page.model';
import { Wizard } from '../../../case-editor/domain/wizard.model';
import { PageValidationService } from '../../../case-editor/services/page-validation.service';
import { LinkedCasesState } from '../domain';
import { LinkedCasesPages } from '../enums';
import { LinkedCasesService } from '../services';
import { WriteLinkedCasesComponent } from './write-linked-cases.component';
import createSpyObj = jasmine.createSpyObj;

describe('WriteLinkedCasesComponent', () => {
  let component: WriteLinkedCasesComponent;
  let fixture: ComponentFixture<WriteLinkedCasesComponent>;
  let caseEditPageComponent: CaseEditPageComponent;
  let caseEditComponentStub: any;
  let dialog: any;
  let route: any;
  let router = {
    url: 'linkCases'
  }

  const someObservable = {
    'subscribe': () => new Draft()
  };
  const caseField2 = new CaseField();
  const cancelled = createSpyObj('cancelled', ['emit']);
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({'field1': new FormControl('SOME_VALUE')})
  });
  const wizardPage = createWizardPage([createCaseField('field1', 'field1Value')], false, 0);
  const WIZARD = new Wizard([wizardPage]);
  const caseField1 = new CaseField();
  const firstPage = new WizardPage();
  caseEditComponentStub = {
    'form': FORM_GROUP,
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
    'saveDraft': (_: CaseEventData) => of(someObservable),
    'caseDetails': {'case_id': '1234567812345678', 'tabs': [], 'metadataFields': [caseField2]},
  };
  route = {
    params: of({id: 123}),
    snapshot: {
      queryParamMap: createSpyObj('queryParamMap', ['get'])
    }
  };
  const fieldTypeSanitiser = new FieldTypeSanitiser();
  const formValueService = new FormValueService(fieldTypeSanitiser);
  const formErrorService = new FormErrorService();
  const caseFieldService = new CaseFieldService();
  const pageValidationService = new PageValidationService(caseFieldService);
  caseEditPageComponent = new CaseEditPageComponent(caseEditComponentStub,
    route, formValueService, formErrorService, null, pageValidationService, dialog, caseFieldService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        WriteLinkedCasesComponent
      ],
      providers: [
        { provide: Router, useValue: router },
        { provide: CaseEditPageComponent, useValue: caseEditPageComponent },
        LinkedCasesService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteLinkedCasesComponent);
    component = fixture.componentInstance;
    spyOn(caseEditPageComponent, 'getCaseId').and.returnValue(of('1111222233334444'));
    component.caseEditPageComponent = caseEditPageComponent;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called ngOnInit, created a FormGroup with a validator, and set the correct linked cases starting page', () => {
    expect(component.ngOnInit).toBeTruthy();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    expect(component.linkedCasesPage).toBe(LinkedCasesPages.BEFORE_YOU_START);
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
  });

  it('should isAtFinalState return correct state', () => {
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalState()).toEqual(true);
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalState()).toEqual(false);
  });

  it('should proceedToNextState navigate to correct page', () => {
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    component.proceedToNextState();
    expect(component.formGroup.updateValueAndValidity).not.toHaveBeenCalled();
    // expect(component.linkedCasesPage).toEqual(LinkedCasesPages.LINK_CASE);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    component.proceedToNextState();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should isAtFinalState return correct value', () => {
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.isAtFinalState()).toBe(false);
    component.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
    expect(component.isAtFinalState()).toBe(true);
  });

  it('should getNextPage return correct page', () => {
    const linkedCasesState1: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
    expect(component.getNextPage(linkedCasesState1)).toEqual(LinkedCasesPages.LINK_CASE);

    const linkedCasesState2: LinkedCasesState = {
      currentLinkedCasesPage: LinkedCasesPages.LINK_CASE,
      navigateToNextPage: true
    };
    component.linkedCasesPage = LinkedCasesPages.LINK_CASE;
    expect(component.getNextPage(linkedCasesState2)).toEqual(LinkedCasesPages.CHECK_YOUR_ANSWERS);
  });

  function createCaseField(id: string, value: any, display_context = 'READONLY'): CaseField {
    const cf = new CaseField();
    cf.id = id;
    cf.value = value;
    cf.display_context = display_context;
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
});
