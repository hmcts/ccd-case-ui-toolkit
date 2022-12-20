import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, FieldType } from '../../../domain/definition';
import { FormValidatorsService } from '../../../services';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { PaletteService } from '../palette.service';
import { PaletteUtilsModule } from '../utils';
import { CaseLink } from './domain';
import { LinkedCasesService } from './services';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import createSpyObj = jasmine.createSpyObj;

const VALUE = {
  CaseReference: '1234-5678-1234-5678'
};
const FIELD_ID = 'NewCaseLink';
const FIELD_TYPE: FieldType = {
  id: 'CaseLink',
  type: 'Collection',
};
const CASE_REFERENCE: CaseField = ({
  id: 'CaseReference',
  label: 'Case Reference',
  field_type: {id: 'TextCaseReference', type: 'Text'}
}) as CaseField;

const CASE_FIELD: CaseField = ({
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
}) as CaseField;

const linkedCases: CaseLink[] = [
  {
    caseReference: '1682374819203471',
    reasons: [],
    createdDateTime: '',
    caseType: 'SSCS',
    caseTypeDescription: 'SSCS case type',
    caseState: 'state',
    caseStateDescription: 'state description',
    caseService: 'Tribunal',
    caseName: 'SSCS 2.1'
  },
  {
    caseReference: '1682897456391875',
    reasons: [],
    createdDateTime: '',
    caseType: 'SSCS',
    caseTypeDescription: 'SSCS case type',
    caseState: 'state',
    caseStateDescription: 'state description',
    caseService: 'Tribunal',
    caseName: 'SSCS 2.1'
  }
];
const linkedCasesService = {
  caseId: '1682374819203471',
  linkedCases
};

class FieldTestComponent {}

describe('WriteCaseLinkFieldComponent', () => {
  const FORM_GROUP: FormGroup = new FormGroup({});
  let formValidatorService: any;
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;
  let route: any;
  let paletteService: any;

  beforeEach(waitForAsync(() => {
    formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
    paletteService = createSpyObj<PaletteService>('paletteService', [
      'getFieldComponentClass'
    ]);
    paletteService.getFieldComponentClass.and.returnValue(FieldTestComponent);
    route = {
      params: of({id: 123}),
      snapshot: {
        queryParamMap: createSpyObj('queryParamMap', ['get'])
      }
    };

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
        { provide: LinkedCasesService, useValue: linkedCasesService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteCaseLinkFieldComponent);
    component = fixture.componentInstance;
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
