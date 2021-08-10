import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';
import { DebugElement } from '@angular/core';
import { CaseField, FieldType } from '../../../domain/definition';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils';

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
    complex_fields: [CASE_REFERENCE]
  },
  value: VALUE,
  retain_hidden_value: true
});

const FORM_GROUP: FormGroup = new FormGroup({
  'Id': new FormControl('LinkedCase'),
  'CaseReference': new FormControl(VALUE),
});

describe('WriteCaseLinkFieldComponent', () => {
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        PaletteUtilsModule
      ],
      declarations: [
        WriteCaseLinkFieldComponent,
      ],
      providers: []
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteCaseLinkFieldComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.caseLinkGroup = FORM_GROUP;
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

  it('verify formgroup controls', () => {
    expect(component.caseLinkGroup.controls['Id']).toBeTruthy();
    expect(component.caseLinkGroup.controls['Id'].value).toBe('LinkedCase');
    expect(component.caseLinkGroup.controls['CaseReference']).toBeTruthy();
    expect(component.caseLinkGroup.controls['CaseReference'].value).toBe(component.caseLinkGroup['controls']['CaseReference'].value);
  });
});
