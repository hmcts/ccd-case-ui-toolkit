import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { MockComponent } from 'ng2-mock-component';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { WritePhoneUKFieldComponent } from './write-phone-uk-field.component';

const FIELD_ID = 'PersonPhoneNumber';
const FIELD_TYPE: FieldType = {
  id: 'PhoneUK',
  type: 'PhoneUK'
};
const VALUE = '07123456789';
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WritePhoneUKFieldComponent', () => {

  const $INPUT = By.css('.form-group input');

  // Input is mocked so that one-way bound inputs can be tested
  let Input: any = MockComponent({ selector: 'input', inputs: [
    'type',
    'formControl'
  ]});

  let fixture: ComponentFixture<WritePhoneUKFieldComponent>;
  let component: WritePhoneUKFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WritePhoneUKFieldComponent,

          // Mock
          Input,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WritePhoneUKFieldComponent);
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
    let input = de.query($INPUT);

    expect(input.nativeElement.getAttribute('type')).toBe('tel');
    expect(input.componentInstance.formControl).toEqual(component.phoneUkControl);
  });
});
