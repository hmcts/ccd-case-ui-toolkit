import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { PaletteUtilsModule } from '../utils';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';

describe('WriteMoneyGbpFieldComponent', () => {

  const FIELD_ID = 'Wage';
  const FIELD_TYPE: FieldType = {
    id: 'MoneyGBP',
    type: 'MoneyGBP'
  };
  const VALUE = '23';
  const CASE_FIELD: CaseField = ({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  }) as CaseField;

  const FORM_GROUP: FormGroup = new FormGroup({});

  let fixture: ComponentFixture<WriteMoneyGbpFieldComponent>;
  let component: WriteMoneyGbpFieldComponent;
  let de: DebugElement;
  const caseFieldService = new CaseFieldService();

  beforeEach(waitForAsync(() => {
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

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(component.formGroup.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(component.formGroup.controls[FIELD_ID].value).toBe(VALUE);
  });

  it('should render `ccd-money-gbp-input`', () => {
    const input = de.query(By.directive(MoneyGbpInputComponent));

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
  const CASE_FIELD: CaseField = ({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  }) as CaseField;

  const FORM_GROUP: FormGroup = new FormGroup({});

  let fixture: ComponentFixture<WriteMoneyGbpFieldComponent>;
  let component: WriteMoneyGbpFieldComponent;
  let de: DebugElement;
  const caseFieldService = new CaseFieldService();

  beforeEach(waitForAsync(() => {
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

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should add a formControl linked to the field ID to the formGroup', () => {
    expect(component.formGroup.controls[FIELD_ID]).toBeTruthy();
  });

  it('should initialise formControl with provided value', () => {
    expect(component.formGroup.controls[FIELD_ID].value).toBe(VALUE);
  });

  it('should render `ccd-money-gbp-input`', () => {
    const input = de.query(By.directive(MoneyGbpInputComponent));

    expect(input).toBeTruthy();
  });
});
