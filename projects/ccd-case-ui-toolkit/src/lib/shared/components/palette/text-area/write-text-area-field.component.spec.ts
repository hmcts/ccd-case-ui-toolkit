import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteTextAreaFieldComponent } from './write-text-area-field.component';

const FIELD_ID = 'PersonFirstName';
const FIELD_TYPE: FieldType = {
  id: 'TextArea',
  type: 'TextArea'
};
const VALUE = 'Hello world';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteTextAreaFieldComponent', () => {

  const $INPUT = By.css('.form-group textarea');

  // Textarea input is mocked so that one-way bound inputs can be tested
  const Textarea: any = MockComponent({ selector: 'textarea', inputs: [
    'formControl'
  ]});

  let fixture: ComponentFixture<WriteTextAreaFieldComponent>;
  let component: WriteTextAreaFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteTextAreaFieldComponent,
          MockRpxTranslatePipe,
          // Mock
          Textarea,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteTextAreaFieldComponent);
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

    expect(input.componentInstance.formControl).toEqual(component.textareaControl);
  });
});
