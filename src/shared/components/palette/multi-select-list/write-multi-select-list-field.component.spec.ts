import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { attr } from '../../../test/helpers';
import { WriteMultiSelectListFieldComponent } from './write-multi-select-list-field.component';

const VALUES = [ 'Option1', 'Option3' ];
const FIELD_ID = 'MultiSelectList1';
const FIELD_TYPE: FieldType = {
  id: 'MultiSelectList',
  type: 'MultiSelectList',
  fixed_list_items: [
    {
      code: 'Option1',
      label: 'Option 1',
      order: 1
    },
    {
      code: 'Option2',
      label: 'Option 2',
      order: 2
    },
    {
      code: 'Option3',
      label: 'Option 3',
      order: 3
    }
  ]
};
const CASE_FIELD: CaseField = new CaseField();
CASE_FIELD.id = FIELD_ID;
CASE_FIELD.label = 'X';
CASE_FIELD.field_type = FIELD_TYPE;
CASE_FIELD.value = VALUES;

const REGISTER_CONTROL = (control) => {
  return control;
};

describe('WriteMultiSelectListFieldComponent', () => {

  const $CHECKBOXES = By.css('input[type="checkbox"]');
  const $SELECTED_CHECKBOXES = By.css('input[type="checkbox"]:checked');
  const $OPTION_1 = By.css('input[value="Option1"]');
  const $OPTION_2 = By.css('input[value="Option2"]');

  let fixture: ComponentFixture<WriteMultiSelectListFieldComponent>;
  let component: WriteMultiSelectListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {

    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteMultiSelectListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteMultiSelectListFieldComponent);
    component = fixture.componentInstance;

    component.registerControl = REGISTER_CONTROL;
    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should register a FormArray', () => {
    expect(component.checkboxes.constructor).toBe(FormArray);
  });

  it('should initialise FormArray with initial values', () => {
    expect(component.checkboxes.controls.length).toEqual(2);
    expect(component.checkboxes.controls[0].value).toEqual(VALUES[0]);
    expect(component.checkboxes.controls[1].value).toEqual(VALUES[1]);
  });

  it('should render a checkbox for each available option', () => {
    let checkboxes = de.queryAll($CHECKBOXES);

    expect(checkboxes.length).toEqual(FIELD_TYPE.fixed_list_items.length);

    FIELD_TYPE.fixed_list_items.forEach(item => {
      expect(checkboxes.find(checkbox => attr(checkbox, 'value') === item.code)).toBeTruthy();
    });
  });

  it('should mark as selected the initially selected checkboxes', () => {
    let checkboxes = de.queryAll($SELECTED_CHECKBOXES);

    expect(checkboxes.length).toEqual(VALUES.length);

    VALUES.forEach(value => {
      expect(checkboxes.find(checkbox => attr(checkbox, 'value') === value)).toBeTruthy();
    });
  });

  it('should remove option from values when unselected', () => {
    let option1 = de.query($OPTION_1).nativeElement;
    option1.click();

    fixture.detectChanges();

    expect(option1.checked).toBeFalsy();
    expect(component.checkboxes.controls.length).toEqual(1);
    expect(component.checkboxes.controls[0].value).not.toEqual(FIELD_TYPE.fixed_list_items[0].code);
  });

  it('should add option to values when selected', () => {
    let option2 = de.query($OPTION_2).nativeElement;
    option2.click();

    fixture.detectChanges();

    expect(option2.checked).toBeTruthy();
    expect(component.checkboxes.controls.length).toEqual(3);
    expect(component.checkboxes.controls[2].value).toEqual(FIELD_TYPE.fixed_list_items[1].code);
  });
});
