import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteTextFieldComponent } from './write-text-field.component';

const FIELD_ID = 'PersonFirstName';
const FIELD_TYPE: FieldType = {
  id: 'Text',
  type: 'Text'
};
const VALUE = 'Hello world';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  field_type: FIELD_TYPE,
  value: VALUE,
  display_context: 'OPTIONAL'
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteTextFieldComponent', () => {

  const $INPUT = By.css('.form-group input');

  // Input is mocked so that one-way bound inputs can be tested
  const Input: any = MockComponent({ selector: 'input', inputs: [
    'type',
    'formControl'
  ]});

  let fixture: ComponentFixture<WriteTextFieldComponent>;
  let component: WriteTextFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteTextFieldComponent,

          // Mock
          Input,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteTextFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

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
    const input = de.query($INPUT);

    expect(input.nativeElement.getAttribute('type')).toBe('text');
    expect(input.componentInstance.formControl).toEqual(component.textControl);
  });
});
