import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { WriteDynamicRadioListFieldComponent } from './write-dynamic-radio-list-field.component';
import { attr, text } from '../../../test/helpers';

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
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteDynamicRadioListFieldComponent', () => {

  const $RADIO = By.css('.form-group input[type="radio"]');

  let fixture: ComponentFixture<WriteDynamicRadioListFieldComponent>;
  let component: WriteDynamicRadioListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteDynamicRadioListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDynamicRadioListFieldComponent);
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

  it('should render all options', () => {
    let options = de.queryAll($RADIO);

    expect(options.length).toEqual(3);
    console.log('Radio', options);
    expect(attr(options[0], 'id')).toEqual('MarritalStatus-M');
    expect(attr(options[1], 'id')).toEqual('MarritalStatus-F');
    expect(attr(options[2], 'id')).toEqual('MarritalStatus-O');
  });
});
