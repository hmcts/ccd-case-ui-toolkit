import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { WriteDynamicListFieldComponent } from './write-dynamic-list-field.component';
import { attr, text } from '../../../test/helpers';

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_ID = 'MarritalStatus';
const OTHER_VALUE = '{"default":{"code":"O","label":"Other"},' +
  '"dynamic_list_items":[{"code":"M","label":"Male"},{"code":"F","label":"Female"},' +
  '{"code":"O","label":"Other"}]}';
const MALE_VALUE = '{"default":{"code":"M","label":"Male"},' +
  '"dynamic_list_items":[{"code":"M","label":"Male"},{"code":"F","label":"Female"},' +
  '{"code":"O","label":"Other"}]}';
const FEMALE_VALUE = '{"default":{"code":"F","label":"Female"},' +
  '"dynamic_list_items":[{"code":"M","label":"Male"},{"code":"F","label":"Female"},' +
  '{"code":"O","label":"Other"}]}';

const FIELD_TYPE: FieldType = {
  id: 'Gender',
  type: 'DynamicList',
  dynamic_list_items: [
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
const CASE_FIELD: CaseField = {
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
};

const FORM_GROUP: FormGroup = new FormGroup({});
const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

describe('WriteDynamicListFieldComponent', () => {

  const $SELECT = By.css('.form-group select');
  const $OPTION = By.css('.form-group option');

  let fixture: ComponentFixture<WriteDynamicListFieldComponent>;
  let component: WriteDynamicListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteDynamicListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDynamicListFieldComponent);
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
    expect(attr(options[1], 'value')).toEqual(MALE_VALUE);
    expect(text(options[1])).toEqual('Male');
    expect(attr(options[2], 'value')).toEqual(FEMALE_VALUE);
    expect(text(options[2])).toEqual('Female');
    expect(attr(options[3], 'value')).toEqual(OTHER_VALUE);
    expect(text(options[3])).toEqual('Other');

  });

  it('should link select element to formControl', () => {

    component.dynamicListControl.setValue(OTHER_VALUE);

    let select = de.query($SELECT);
    fixture.detectChanges();

    expect(select.nativeElement.value).toEqual(OTHER_VALUE);
  });
});
