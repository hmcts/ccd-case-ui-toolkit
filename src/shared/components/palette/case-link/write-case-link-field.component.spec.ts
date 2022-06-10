import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { CaseField, FieldType } from '../../../domain/definition';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils';
import { RouterTestingModule } from '@angular/router/testing';
import { LinkedCasesService } from './services';
import { CaseLink } from './domain';

const VALUE = {
  CaseReference: '1234-5678-1234-5678'
};
const FIELD_ID = 'NewCaseLink';
const FIELD_TYPE: FieldType = {
  id: 'CaseLink',
  type: 'Complex',
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

describe('WriteCaseLinkFieldComponent', () => {
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
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
        { provide: LinkedCasesService, useValue: linkedCasesService }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteCaseLinkFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
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

  it('should set retain_hidden_value to true for all sub-fields that are part of a CaseLink field', () => {
    expect(component.caseField.field_type.complex_fields.length).toEqual(1);
    expect(component.caseField.field_type.complex_fields[0].retain_hidden_value).toEqual(true);
  });

});
