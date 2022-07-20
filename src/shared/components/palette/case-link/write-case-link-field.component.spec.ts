import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { CaseField, FieldType } from '../../../domain/definition';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesService } from './services';
import { CaseLink } from './domain';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { of } from 'rxjs';
import { CaseEventData, Draft } from '../../../domain';
import { FieldTypeSanitiser, FormValueService, FormErrorService, CaseFieldService, FormValidatorsService } from '../../../services';
import { PageValidationService, Wizard, WizardPage } from '../../case-editor';
import { PaletteService } from '../palette.service';
import createSpyObj = jasmine.createSpyObj;

const VALUE = {
  CaseReference: '1234-5678-1234-5678'
};
const FIELD_ID = 'NewCaseLink';
const FIELD_TYPE: FieldType = {
  id: 'CaseLink',
  type: 'Collection',
};
const CASE_REFERENCE: CaseField = <CaseField>({
  id: 'CaseReference',
  label: 'Case Reference',
  field_type: {id: 'TextCaseReference', type: 'Text'}
});

const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'New Case Link',
  display_context: 'OPTIONAL',
  field_type: {
    ...FIELD_TYPE,
    collection_field_type: FIELD_TYPE,
    complex_fields: [CASE_REFERENCE]
  },
  value: VALUE,
  retain_hidden_value: true
});

const linkedCases: CaseLink[] = [
  {
    caseReference: '1682374819203471',
    reasons: [],
    createdDateTime: '',
    caseType: 'SSCS',
    caseState: 'state',
    caseService: 'Tribunal',
    caseName: 'SSCS 2.1'
  },
  {
    caseReference: '1682897456391875',
    reasons: [],
    createdDateTime: '',
    caseType: 'SSCS',
    caseState: 'state',
    caseService: 'Tribunal',
    caseName: 'SSCS 2.1'
  }
];
const linkedCasesService = {
  caseId: '1682374819203471',
  linkedCases: linkedCases
};

class FieldTestComponent {}

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

function createCaseField(id: string, value: any, display_context = 'READONLY'): CaseField {
  const cf = new CaseField();
  cf.id = id;
  cf.value = value;
  cf.display_context = display_context;
  return cf;
}



describe('WriteCaseLinkFieldComponent', () => {
  const FORM_GROUP: FormGroup = new FormGroup({});
  let caseEditPageComponent: CaseEditPageComponent;
  let formValidatorService: any
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;
  const caseField2 = new CaseField();
  let route: any;
  const fieldTypeSanitiser = new FieldTypeSanitiser();
  const formValueService = new FormValueService(fieldTypeSanitiser);
  const formErrorService = new FormErrorService();
  const caseFieldService = new CaseFieldService();
  const pageValidationService = new PageValidationService(caseFieldService);
  let dialog: any;
  let paletteService: any;
  let caseEditComponentStub: any;
  const wizardPage = createWizardPage([createCaseField('field1', 'field1Value')], false, 0);
  const WIZARD = new Wizard([wizardPage]);
  const caseField1 = new CaseField();
  const firstPage = new WizardPage();
  let cancelled: any;
  const someObservable = {
    'subscribe': () => new Draft()
  };

  beforeEach(async(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);
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

    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PaletteUtilsModule,
        RouterTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [
        WriteCaseLinkFieldComponent,
      ],
      providers: [
        { provide: LinkedCasesService, useValue: linkedCasesService },
        { provide: CaseEditPageComponent, useValue: caseEditPageComponent },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteCaseLinkFieldComponent);
    component = fixture.componentInstance;
    component.caseEditPageComponent = caseEditComponentStub;
    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render the case reference', () => {
    expect(component).toBeTruthy();
  });

  it('should validate the case reference number', () => {
    expect(component.validCaseReference('InvalidCharacters')).toBeFalsy();
    expect(component.validCaseReference('1234567812345678')).toBeTruthy();
    expect(component.validCaseReference('1234-5678-1234-5678')).toBeTruthy();
    expect(component.validCaseReference('123456781234567890')).toBeFalsy();
    expect(component.validCaseReference('1234Invalid')).toBeFalsy();
  });
  
});
