import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';
import { attr, text } from '../../../test/helpers';
import { newCaseField } from '../../../fixture';

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_ID = 'MarritalStatus';
const FIELD_TYPE: FieldType = {
  id: 'Gender',
  type: 'FixedList',
  fixed_list_items: [
    {
      code: 'M',
      label: 'Male'
    },
    {
      code: VALUE,
      label: EXPECTED_LABEL
    },
    {
      code: 'O',
      label: 'Other'
    }
  ]
};
const CASE_FIELD: CaseField = newCaseField(FIELD_ID, 'X', null, FIELD_TYPE, 'OPTIONAL').withValue(VALUE).build();

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteFixedListFieldComponent', () => {

  const $SELECT = By.css('.form-group select');
  const $OPTION = By.css('.form-group option');

  let fixture: ComponentFixture<WriteFixedListFieldComponent>;
  let component: WriteFixedListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteFixedListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteFixedListFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
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

  it('should render all options', () => {
    let options = de.queryAll($OPTION);

    expect(options.length).toEqual(4);
    expect(attr(options[0], 'value')).toEqual('');
    expect(text(options[0])).toEqual('--Select a value--');
    expect(attr(options[1], 'value')).toEqual('M');
    expect(text(options[1])).toEqual('Male');
    expect(attr(options[2], 'value')).toEqual('F');
    expect(text(options[2])).toEqual('Female');
    expect(attr(options[3], 'value')).toEqual('O');
    expect(text(options[3])).toEqual('Other');

  });

  it('should link select element to formControl', () => {

    component.fixedListControl.setValue('M');

    let select = de.query($SELECT);
    fixture.detectChanges();

    expect(select.nativeElement.value).toEqual('M');
  });
});
