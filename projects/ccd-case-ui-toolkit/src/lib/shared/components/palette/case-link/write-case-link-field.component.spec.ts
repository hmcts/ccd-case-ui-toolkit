import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaseField, FieldType } from '../../../domain/definition';
import { PaletteUtilsModule } from '../utils';
import { WriteCaseLinkFieldComponent } from './write-case-link-field.component';

const VALUE = {
  CaseReference: '1234-5678-1234-5678'
};
const FIELD_ID = 'NewCaseLink';
const FIELD_TYPE: FieldType = {
  id: 'CaseLink',
  type: 'Complex',
};
const CASE_REFERENCE: CaseField = {
  id: 'CaseReference',
  label: 'Case Reference',
  field_type: {id: 'TextCaseReference', type: 'Text'}
} as CaseField;

const CASE_FIELD: CaseField = {
  id: FIELD_ID,
  label: 'New Case Link',
  display_context: 'OPTIONAL',
  field_type: {
    ...FIELD_TYPE,
    complex_fields: [CASE_REFERENCE]
  },
  value: VALUE,
  retain_hidden_value: true
} as CaseField;

describe('WriteCaseLinkFieldComponent', () => {
  let component: WriteCaseLinkFieldComponent;
  let fixture: ComponentFixture<WriteCaseLinkFieldComponent>;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
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
    component.caseLinkGroup = new FormGroup({
      CaseReference: new FormControl(CASE_FIELD.value.CaseReference)
    });
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render the case reference', () => {
    expect(component).toBeTruthy();
  });

  it('should render the page with invalid case reference', () => {
    component.caseLinkGroup.controls['CaseReference'].setValue('InvalidCharacters');
    fixture.detectChanges();
    expect(component).toBeTruthy();
    component.caseLinkGroup.controls['CaseReference'].setValue(null);
    component.caseLinkGroup.controls['CaseReference'].markAsTouched({onlySelf: true});
    component.caseLinkGroup.controls['CaseReference'].updateValueAndValidity();
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set retain_hidden_value to true for all sub-fields that are part of a CaseLink field', () => {
    expect(component.caseField.field_type.complex_fields.length).toEqual(1);
    expect(component.caseField.field_type.complex_fields[0].retain_hidden_value).toEqual(true);
  });

  afterEach(() => {
    fixture.destroy();
  });
});
