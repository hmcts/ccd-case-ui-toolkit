import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RpxTranslationService } from 'rpx-xui-translation';

import { FormModule } from '../../../../components/form/form.module';
import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { DatetimePickerComponent } from '../datetime-picker/datetime-picker.component';
import { PaletteUtilsModule } from '../utils';
import { WriteDateContainerFieldComponent } from './write-date-container-field.component';
import { WriteDateFieldComponent } from './write-date-field.component';

const FIELD_ID = 'CreatedAt';
const FIELD_TYPE: FieldType = {
  id: 'Date',
  type: 'Date'
};
const VALUE = '2017-07-26';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  display_context: 'OPTIONAL',
  field_type: FIELD_TYPE,
  value: VALUE
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

describe('WriteDateContainerFieldComponent', () => {

  let fixture: ComponentFixture<WriteDateContainerFieldComponent>;
  let component: WriteDateContainerFieldComponent;
  let de: DebugElement;
  const caseFieldService = new CaseFieldService();

  beforeEach(waitForAsync(() => {
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
          WriteDateContainerFieldComponent, WriteDateFieldComponent, DatetimePickerComponent, MockRpxTranslatePipe
        ],
        providers: [
          FormatTranslatorService,
          {provide: CaseFieldService, useValue: caseFieldService},
          { provide: RpxTranslationService, useValue: jasmine.createSpyObj('RpxTranslationService',
        ['getTranslation', 'translate']) },
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
    const NEW_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'DATETIMEENTRY',
      field_type: FIELD_TYPE,
      value: VALUE,
      dateTimeEntryFormat: 'DD/MM/YYYY HH:mm:ss'
    }) as CaseField;
    component.caseField = NEW_CASE_FIELD;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ccd-datetime-picker')).not.toBe(null);
  });
});
