import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { attr } from '../../../test/helpers';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteDynamicRadioListFieldComponent } from './write-dynamic-radio-list-field.component';

const VALUE = 'F';
const EXPECTED_LABEL = 'Female';
const FIELD_ID = 'MaritalStatus';
const FIELD_LIST_ITEMS = [
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
];

const FIELD_TYPE: FieldType = {
  id: 'Gender',
  type: 'DynamicList',
};

const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE,
  list_items: FIELD_LIST_ITEMS
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteDynamicRadioListFieldComponent', () => {

  const $RADIO = By.css('.form-group input[type="radio"]');

  let fixture: ComponentFixture<WriteDynamicRadioListFieldComponent>;
  let component: WriteDynamicRadioListFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteDynamicRadioListFieldComponent,
          MockRpxTranslatePipe,
          MockFieldLabelPipe
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
    const options = de.queryAll($RADIO);

    expect(options.length).toEqual(3);
    expect(attr(options[0], 'type')).toEqual('radio');
    expect(attr(options[0], 'id')).toEqual('MaritalStatus_M');
    expect(attr(options[1], 'id')).toEqual('MaritalStatus_F');
    expect(attr(options[2], 'id')).toEqual('MaritalStatus_O');
  });

  // Note: Currently unknown why this is the default for a parent with relevant value
  it('test parent value sets element ID', () => {
    component.parent = {value: {id: '1', value: 'value'}} as any;
    fixture.detectChanges();
    const options = de.queryAll($RADIO);

    expect(options.length).toEqual(3);
    expect(attr(options[0], 'type')).toEqual('radio');
    expect(attr(options[0], 'id')).toEqual('1value');
    expect(attr(options[1], 'id')).toEqual('1value');
    expect(attr(options[2], 'id')).toEqual('1value');
  });

  it('test parent value not present', () => {
    component.parent = {value: null} as any;
    fixture.detectChanges();
    const options = de.queryAll($RADIO);

    expect(options.length).toEqual(3);
    expect(attr(options[0], 'type')).toEqual('radio');
    expect(attr(options[0], 'id')).toEqual('MaritalStatus_M');
    expect(attr(options[1], 'id')).toEqual('MaritalStatus_F');
    expect(attr(options[2], 'id')).toEqual('MaritalStatus_O');
  });
});
