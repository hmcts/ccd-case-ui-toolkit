import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WriteNumberFieldComponent } from './write-number-field.component';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';

const FIELD_ID = 'PersonAge';
const FIELD_TYPE: FieldType = {
  id: 'Number',
  type: 'Number'
};
const VALUE = '23';
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteNumberFieldComponent', () => {

  const $INPUT = By.css('.form-group input');

  // Input is mocked so that one-way bound inputs can be tested
  let Input: any = MockComponent({ selector: 'input', inputs: [
    'type',
    'formControl'
  ]});

  let fixture: ComponentFixture<WriteNumberFieldComponent>;
  let component: WriteNumberFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteNumberFieldComponent,

          // Mock
          Input,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteNumberFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
  });

  it('should render text input element linked to formControl', () => {
    let input = de.query($INPUT);

    expect(input.nativeElement.getAttribute('type')).toBe('number');
    expect(input.componentInstance.formControl).toEqual(component.numberControl);
  });
});
