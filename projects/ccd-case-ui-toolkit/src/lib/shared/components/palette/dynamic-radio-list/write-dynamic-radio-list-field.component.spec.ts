import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { attr } from '../../../test/helpers';
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
          PaletteUtilsModule,
          RpxTranslationModule.forRoot({
            baseUrl: '',
            debounceTimeMs: 300,
            testMode: true,
            validity: {
              days: 1
            }
          })
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
    const options = de.queryAll($RADIO);

    expect(options.length).toEqual(3);
    expect(attr(options[0], 'type')).toEqual('radio');
    expect(attr(options[0], 'id')).toEqual('MaritalStatus-M');
    expect(attr(options[1], 'id')).toEqual('MaritalStatus-F');
    expect(attr(options[2], 'id')).toEqual('MaritalStatus-O');
  });
});
