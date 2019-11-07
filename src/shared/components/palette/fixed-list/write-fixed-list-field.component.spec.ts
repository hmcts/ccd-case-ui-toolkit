import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';
import { attr, text } from '../../../test/helpers';

const REGISTER_CONTROL = (control) => {
  FORM_GROUP.addControl(FIELD_ID, control);
  return control;
};

const FORM_GROUP: FormGroup = new FormGroup({});

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_ID = 'MarritalStatus';
const FIELD_TYPE: FieldType = {
  id: 'Gender',
  type: 'FixedList',
  fixed_list_items: [
    {
      code: 'M',
      label: 'Male',
      order: 1
    },
    {
      code: VALUE,
      label: EXPECTED_LABEL,
      order: 2
    },
    {
      code: 'O',
      label: 'Other',
      order: 3
    }
  ]
};
const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

describe('WriteFixedListFieldComponent with DisplayOrder', () => {

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

const VALUE_WITHOUT_DISPLAY_ORDER = 'B';
const EXPECTED_LABEL_WITHOUT_DISPLAY_ORDER = 'b';
const FIELD_ID_WITHOUT_DISPLAY_ORDER = 'Letters';

const FIELD_TYPE_WITHOUT_DISPLAY_ORDER: FieldType = {
  id: FIELD_ID_WITHOUT_DISPLAY_ORDER,
  type: 'FixedList',
  fixed_list_items: [
    {
      code: 'C',
      label: 'c',
      order: null
    },
    {
      code: VALUE_WITHOUT_DISPLAY_ORDER,
      label: EXPECTED_LABEL_WITHOUT_DISPLAY_ORDER,
      order: null
    },
    {
      code: 'A',
      label: 'a',
      order: null
    }
  ]
};
const CASE_FIELD_WITHOUT_DISPLAY_ORDER: CaseField = Object.assign(new CaseField(), {
  id: FIELD_ID_WITHOUT_DISPLAY_ORDER,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE_WITHOUT_DISPLAY_ORDER,
  value: VALUE_WITHOUT_DISPLAY_ORDER
});

const FORM_GROUP_WITHOUT_DISPLAY_ORDER: FormGroup = new FormGroup({});

const REGISTER_CONTROL_WITHOUT_DISPLAY_ORDER = (control) => {
  FORM_GROUP_WITHOUT_DISPLAY_ORDER.addControl(FIELD_ID_WITHOUT_DISPLAY_ORDER, control);
  return control;
};

describe('WriteFixedListFieldComponent without DisplayOrder', () => {

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

    component.registerControl = REGISTER_CONTROL_WITHOUT_DISPLAY_ORDER;
    component.caseField = CASE_FIELD_WITHOUT_DISPLAY_ORDER;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(FORM_GROUP_WITHOUT_DISPLAY_ORDER.controls[FIELD_ID_WITHOUT_DISPLAY_ORDER]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(FORM_GROUP_WITHOUT_DISPLAY_ORDER.controls[FIELD_ID_WITHOUT_DISPLAY_ORDER].value).toBe(VALUE_WITHOUT_DISPLAY_ORDER);
  });

  it('should render all options', () => {
    let options = de.queryAll($OPTION);

    expect(options.length).toEqual(4);
    expect(attr(options[0], 'value')).toEqual('');
    expect(text(options[0])).toEqual('--Select a value--');
    expect(attr(options[1], 'value')).toEqual('A');
    expect(text(options[1])).toEqual('a');
    expect(attr(options[2], 'value')).toEqual('B');
    expect(text(options[2])).toEqual('b');
    expect(attr(options[3], 'value')).toEqual('C');
    expect(text(options[3])).toEqual('c');

  });

  it('should link select element to formControl', () => {

    component.fixedListControl.setValue('B');

    let select = de.query($SELECT);
    fixture.detectChanges();

    expect(select.nativeElement.value).toEqual('B');
  });
});
