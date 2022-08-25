import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { attr } from '../../../test/helpers';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WriteFixedRadioListFieldComponent } from './write-fixed-radio-list-field.component';

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
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteFixedRadioListFieldComponent', () => {

  const $RADIO = By.css('.form-group input[type="radio"]');

  let fixture: ComponentFixture<WriteFixedRadioListFieldComponent>;
  let component: WriteFixedRadioListFieldComponent;
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
          WriteFixedRadioListFieldComponent,
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteFixedRadioListFieldComponent);
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
    expect(attr(options[0], 'id')).toEqual('MarritalStatus-M');
    expect(attr(options[1], 'id')).toEqual('MarritalStatus-F');
    expect(attr(options[2], 'id')).toEqual('MarritalStatus-O');
  });
});
