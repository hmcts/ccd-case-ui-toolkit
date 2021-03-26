import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain';
import { CaseField } from '../../../domain';
import { PaletteUtilsModule } from '../utils';
import { WriteDateFieldComponent } from './write-date-field.component';
import { CaseFieldService } from '../../../services';
import { FormModule } from '../../../../components/form/form.module';
import { WriteDateFieldContainerComponent } from './write-date-field-container.component';
import { DatetimePickerComponent } from '../datetime-picker/datetime-picker.component';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { isExportDeclaration } from 'typescript';

const FIELD_ID = 'CreatedAt';
const FIELD_TYPE: FieldType = {
  id: 'Date',
  type: 'Date'
};
const VALUE = '2017-07-26';
const CASE_FIELD: CaseField = <CaseField>({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
});

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteDateContainerComponent', () => {

  let fixture: ComponentFixture<WriteDateFieldContainerComponent>;
  let component: WriteDateFieldContainerComponent;
  let de: DebugElement;
  let caseFieldService = new CaseFieldService();

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [
          NgxMatDatetimePickerModule,
          NgxMatTimepickerModule,
          NgxMatNativeDateModule,
          NoopAnimationsModule,
          MatFormFieldModule,
          MatInputModule,
          MatDatepickerModule,
          ReactiveFormsModule,
          PaletteUtilsModule,
          FormModule,
        ],
        declarations: [
          WriteDateFieldContainerComponent, WriteDateFieldComponent, DatetimePickerComponent
        ],
        providers: [
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDateFieldContainerComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.formGroup = FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeDefined();
  });

  it('should show WriteDateFieldComponent when dateTimeEntryFormat not given', () => {
    expect(fixture.nativeElement.querySelector('ccd-write-date-field')).not.toBe(null);
  });

  it('should show DateTimePickerComponent when dateTimeEntryFormat given', () => {
    const NEW_CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      display_context: 'DATETIMEENTRY',
      field_type: FIELD_TYPE,
      value: VALUE
    });
    component.caseField = NEW_CASE_FIELD;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ccd-datetime-picker')).not.toBe(null);
  });
});
