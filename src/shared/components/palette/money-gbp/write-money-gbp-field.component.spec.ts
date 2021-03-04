import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { By } from '@angular/platform-browser';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';

describe('WriteMoneyGbpFieldComponent', () => {

  const FIELD_ID = 'Wage';
  const FIELD_TYPE: FieldType = {
    id: 'MoneyGBP',
    type: 'MoneyGBP'
  };
  const VALUE = '23';
  const CASE_FIELD: CaseField = <CaseField>({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  });

  const FORM_GROUP: FormGroup = new FormGroup({});
  const REGISTER_CONTROL = (control) => {
    FORM_GROUP.addControl(FIELD_ID, control);
    return control;
  };

  let fixture: ComponentFixture<WriteMoneyGbpFieldComponent>;
  let component: WriteMoneyGbpFieldComponent;
  let de: DebugElement;
  let caseFieldService = new CaseFieldService();

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteMoneyGbpFieldComponent,
          MoneyGbpInputComponent,
        ],
        providers: [
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteMoneyGbpFieldComponent);
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

  it('should render `ccd-money-gbp-input`', () => {
    let input = de.query(By.directive(MoneyGbpInputComponent));

    expect(input).toBeTruthy();
  });
});

describe('WriteMoneyGbpFieldComponent with negative value', () => {

  const FIELD_ID = 'Wage';
  const FIELD_TYPE: FieldType = {
    id: 'MoneyGBP',
    type: 'MoneyGBP'
  };
  const VALUE = '-2500';
  const CASE_FIELD: CaseField = <CaseField>({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  });

  const FORM_GROUP: FormGroup = new FormGroup({});
  const REGISTER_CONTROL = (control) => {
    FORM_GROUP.addControl(FIELD_ID, control);
    return control;
  };

  let fixture: ComponentFixture<WriteMoneyGbpFieldComponent>;
  let component: WriteMoneyGbpFieldComponent;
  let de: DebugElement;
  let caseFieldService = new CaseFieldService();

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          ReactiveFormsModule,
          PaletteUtilsModule
        ],
        declarations: [
          WriteMoneyGbpFieldComponent,
          MoneyGbpInputComponent,
        ],
        providers: [
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteMoneyGbpFieldComponent);
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

  it('should render `ccd-money-gbp-input`', () => {
    let input = de.query(By.directive(MoneyGbpInputComponent));

    expect(input).toBeTruthy();
  });
});
