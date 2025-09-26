import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
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
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { PaletteUtilsModule } from '../utils';
import { WriteDateContainerFieldComponent } from './write-date-container-field.component';
import { WriteDateFieldComponent } from './write-date-field.component';
// import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { NgxMatMomentAdapter } from '@ngxmc/datetime-picker-moment-adapter';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

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
  // class MockNgxMatDateAdapter {
  //   // Add only the methods your component/test actually calls, or leave empty if not needed
  // }
  beforeEach(waitForAsync(() => {
    TestBed
      .configureTestingModule({
        imports: [
          NoopAnimationsModule,
          MatFormFieldModule,
          MatInputModule,
          MatDatepickerModule,
          ReactiveFormsModule,
          PaletteUtilsModule,
          FormModule,
        ],
        declarations: [
          WriteDateContainerFieldComponent, WriteDateFieldComponent, DatePickerComponent, MockRpxTranslatePipe
        ],
        providers: [
          FormatTranslatorService,
          { provide: CaseFieldService, useValue: caseFieldService },
          {
            provide: RpxTranslationService,
            useValue: jasmine.createSpyObj('RpxTranslationService', ['getTranslation$', 'translate'])
          },
          { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
          { provide: MAT_DATE_FORMATS, useValue: { parse: {}, display: {} } },
          { provide: MAT_DATE_FORMATS, useValue: { parse: {}, display: {} } },
          { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {} },
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
