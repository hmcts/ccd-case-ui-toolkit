import { Component, DebugElement, Input } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { plainToClassFromExist } from 'class-transformer';
import { of } from 'rxjs';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { CaseField } from '../../../domain/definition';
import { Draft } from '../../../domain/draft.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { FieldTypeSanitiser } from '../../../services/form/field-type-sanitiser';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FormValueService } from '../../../services/form/form-value.service';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { WizardPage } from '../../case-editor/domain/wizard-page.model';
import { Wizard } from '../../case-editor/domain/wizard.model';
import { PageValidationService } from '../../case-editor/services/page-validation.service';
import { PaletteService } from '../palette.service';
import { FieldReadComponent } from './field-read.component';
import { PaletteContext } from './palette-context.enum';

import createSpyObj = jasmine.createSpyObj;

const $FIELD_READ_LABEL = By.css('ccd-field-read-label');
const $FIELD_TEST = By.css('ccd-field-read-label span.text-cls');

const CASE_FIELD: CaseField = plainToClassFromExist(new CaseField(), {
  _list_items: [],
  id: 'PersonFirstName',
  label: 'First name',
  field_type: {
    id: 'Text',
    type: 'Text'
  },
  _value: 'Johnny',
  display_context: 'READONLY'
});

const CLASS = 'text-cls';

const FORM_GROUP: FormGroup = new FormGroup({});

@Component({
  template: `
    <span class="${CLASS}"></span>
  `
})
class FieldTestComponent {}

@Component({
  selector: 'ccd-field-read-label',
  template: `
    <ng-content></ng-content>
  `
})
class FieldReadLabelComponent {
  @Input()
  caseField: CaseField;

  @Input()
  withLabel: boolean;

  @Input()
  topLevelFormGroup: FormGroup;

  @Input()
  markdownUseHrefAsRouterLink?: boolean;
}

describe('FieldReadComponent', () => {

  let fixture: ComponentFixture<FieldReadComponent>;
  let component: FieldReadComponent;
  let de: DebugElement;

  let paletteService: any;

  let formGroup: FormGroup = new FormGroup({});
  let caseFields: CaseField[] = [CASE_FIELD];
  let caseEditComponentStub: any;
  const FORM_GROUP = new FormGroup({
    'data': new FormGroup({'field1': new FormControl('SOME_VALUE')})
  });
  const wizardPage = createWizardPage([createCaseField('field1', 'field1Value')], false, 0);
  const WIZARD = new Wizard([wizardPage]);
  const caseField1 = new CaseField();
  const firstPage = new WizardPage();
  let cancelled: any;
  const someObservable = {
    'subscribe': () => new Draft()
  };
  const caseField2 = new CaseField();
  let route: any;
  const fieldTypeSanitiser = new FieldTypeSanitiser();
  const formValueService = new FormValueService(fieldTypeSanitiser);
  const formErrorService = new FormErrorService();
  const caseFieldService = new CaseFieldService();
  const pageValidationService = new PageValidationService(caseFieldService);
  let dialog: any;
  let caseEditPageComponent: CaseEditPageComponent;

  beforeEach(async(() => {
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);

    cancelled = createSpyObj('cancelled', ['emit']);
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
    caseEditPageComponent = new CaseEditPageComponent(caseEditComponentStub,
      route, formValueService, formErrorService, null, pageValidationService, dialog, caseFieldService);

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          FormsModule
        ],
        declarations: [
          FieldReadComponent,

          // Mock
          FieldTestComponent,
          FieldReadLabelComponent,
        ],
        providers: [
          { provide: PaletteService, useValue: paletteService },
          { provide: CaseEditPageComponent, useValue: caseEditPageComponent },
        ]
      })
      .compileComponents();

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [FieldTestComponent]
      }
    });

    fixture = TestBed.createComponent(FieldReadComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseFields = caseFields;
    component.formGroup = formGroup;
    component.context = PaletteContext.CHECK_YOUR_ANSWER;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should get field read class from PaletteService', () => {
    expect(paletteService.getFieldComponentClass).toHaveBeenCalledWith(CASE_FIELD, false);
  });

  it('should inject component instance as child', () => {
    fixture.detectChanges();

    let fieldReadLabelComponent = de.query($FIELD_READ_LABEL);
    expect(fieldReadLabelComponent.children.length).toBe(1);

    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.caseField).toBe(CASE_FIELD);

    let fieldTestComponent = de.query($FIELD_TEST);
    expect(fieldTestComponent).toBeTruthy();

    let fieldTest = fieldTestComponent.componentInstance;
    expect(fieldTest.caseField).toEqual(CASE_FIELD);
    expect(fieldTest.caseFields).toBe(caseFields);
    expect(fieldTest.formGroup).toBe(formGroup);
  });

  it('should pass context to field instance', () => {
    fixture.detectChanges();

    let fieldTest = de.query($FIELD_TEST).componentInstance;
    expect(fieldTest.context).toBe(PaletteContext.CHECK_YOUR_ANSWER);
  });

  it('should NOT display label by default', () => {
    fixture.detectChanges();

    let fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(false);
  });

  it('should display label if required', () => {
    component.withLabel = true;
    fixture.detectChanges();

    let fieldReadLabelComponent = de.query(By.css('ccd-field-read-label'));
    let fieldReadLabel = fieldReadLabelComponent.componentInstance;
    expect(fieldReadLabel.withLabel).toBe(true);
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
