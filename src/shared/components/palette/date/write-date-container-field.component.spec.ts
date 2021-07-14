import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { DatetimePickerComponent } from '../datetime-picker/datetime-picker.component';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { FormModule } from '../../../../components/form/form.module';
import { PaletteUtilsModule } from '../utils';
import { WriteDateFieldComponent } from './write-date-field.component';
import { WriteDateContainerFieldComponent } from './write-date-container-field.component';

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

describe('WriteDateContainerFieldComponent', () => {

  let fixture: ComponentFixture<WriteDateContainerFieldComponent>;
  let component: WriteDateContainerFieldComponent;
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
          WriteDateContainerFieldComponent, WriteDateFieldComponent, DatetimePickerComponent
        ],
        providers: [
          FormatTranslatorService,
          {provide: CaseFieldService, useValue: caseFieldService},
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WriteDateContainerFieldComponent);
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
      value: VALUE,
      dateTimeEntryFormat: 'DD/MM/YYYY HH:mm:ss'
    });
    component.caseField = NEW_CASE_FIELD;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ccd-datetime-picker')).not.toBe(null);
  });
});
