import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteNumberFieldComponent } from './write-number-field.component';

const FIELD_ID = 'PersonAge';
const FIELD_TYPE: FieldType = {
  id: 'Number',
  type: 'Number'
};
const VALUE = '23';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteNumberFieldComponent', () => {
  const $INPUT = By.css('.form-group input');

  // Input is mocked so that one-way bound inputs can be tested
  const inputComponentMock: any = MockComponent({ selector: 'input', inputs: [
    'type',
    'formControl'
  ]});

  let fixture: ComponentFixture<WriteNumberFieldComponent>;
  let component: WriteNumberFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteNumberFieldComponent,
          MockRpxTranslatePipe,

          // Mocks
          inputComponentMock
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteNumberFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP.controls[CASE_FIELD.id]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP.controls[CASE_FIELD.id].value).toBe(VALUE);
  });

  it('should render text input element linked to formControl', () => {
    const input = de.query($INPUT);

    expect(input.nativeElement.getAttribute('type')).toBe('number');
    expect(input.componentInstance.formControl).toEqual(component.numberControl);
  });
});
