import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import moment from 'moment';
import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { MockFieldLabelPipe } from '../../../test/mock-field-label.pipe';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { FirstErrorPipe } from '../utils';
import { CUSTOM_MOMENT_FORMATS } from './date-picker-utils';
import { DatePickerComponent } from './date-picker.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {
  NgxMatDatetimepicker,
  NgxMatDatepickerInput,
  NgxMatDatepickerActions
} from '@ngxmc/datetime-picker';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCalendarHarness, MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';

describe('DatetimePickerComponent', () => {
  let component: DatePickerComponent;
  let fixture: ComponentFixture<DatePickerComponent>;
  const caseFieldService = new CaseFieldService();
  // changing custom formats to make it easier to get date from input
  CUSTOM_MOMENT_FORMATS.parse.dateInput = 'DD/MM/YYYY, HH:mm:ss';
  CUSTOM_MOMENT_FORMATS.display.dateInput = 'DD/MM/YYYY, HH:mm:ss';

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'DateTime'
  };
  const initialDateTime = new Date();
  const initialDateEntryParameter = 'DD/MM/YYYY HH:mm:ss';

  const CASE_FIELD: CaseField = ({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: initialDateTime,
    dateTimeEntryFormat: initialDateEntryParameter
  }) as CaseField;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        NgxMatDatetimepicker,
        NgxMatDatepickerInput,
        NgxMatDatepickerActions
      ],
      declarations: [
        DatePickerComponent, FirstErrorPipe, MockRpxTranslatePipe, MockFieldLabelPipe
      ],
      providers: [FormatTranslatorService,
        { provide: MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
        {
          provide: DateAdapter,
          useClass: MomentDateAdapter,
          deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
        },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: CaseFieldService, useValue: caseFieldService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    component.caseField = CASE_FIELD;
    component.hideTime = false;
    component.hideMinutes = false;
  }));

  afterEach(fakeAsync(() => {
    if (component.datetimePicker) {
      component.datetimePicker.close();
    }
    fixture.destroy();
    flush();
  }));

  it('should create with no issuee via constructor', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    expect(component).toBeDefined();
    flush();
  }));

  it('should initialize with a date value', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(null);
    flush();
  }));

  it('should set datetime format when input clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    spyOn(component, 'setDateTimeFormat');
    component.focusIn();
    expect(component.setDateTimeFormat).toHaveBeenCalled();
    flush();
  }));

  it('should set datetime format when datetime picker opened', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    spyOn(component, 'setDateTimeFormat');
    component.toggleClick();
    expect(component.setDateTimeFormat).toHaveBeenCalled();
    flush();
  }));

  it('should open view when datetime picker opened', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

    component.datetimePicker.open();
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
    flush();
    discardPeriodicTasks();
  }));

  it('should open view when toggle clicked', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

    const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the format via caseField', fakeAsync(() => {
    const firstDateEntryParameter = 'DD-MM-YYYY HH+mm+ss';

    const FIRST_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    }) as CaseField;

    component.caseField = FIRST_CASE_FIELD;
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();

    const firstFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(firstFormattedDate).not.toBe(null);
    // EUI-4118 - changed test to refer back to previous case field due to intermittent errors based on reactive form
    component.caseField = CASE_FIELD;
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();

    const newFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(newFormattedDate).not.toBe(null);

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to confirm the selected datetime', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    const initialValue = fixture.nativeElement.querySelector('input').value;

    const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const confirm = fixture.debugElement.query(By.css('.mat-datepicker-actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').value).toBe(initialValue);
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the selected date', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    const initialValue = fixture.nativeElement.querySelector('input').value;
    const initialDate = new Date();

    const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    const confirm = fixture.debugElement.query(By.css('.mat-datepicker-actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    let setDay = fixture.nativeElement.querySelector('input').value.split('/');
    const d = parseInt(setDay[0], 10);
    const m = parseInt(setDay[1], 10);
    const y = parseInt(setDay[2], 10);
    setDay = new Date(y, m - 1, d);

    // check the new input against the first day of the month of the year in order to verify
    const firstDay = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    if (initialDate.getDate() !== 1) {
      expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    }
    expect(setDay.getFullYear()).toBe(firstDay.getFullYear());
    expect(setDay.getMonth()).toBe(firstDay.getMonth());
    expect(setDay.getDay()).toBe(firstDay.getDay());
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to confirm datepicker concurs with formatting', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const firstDateEntryParameter = 'DD-MM-YYYY HH+mm+ss';

    const FIRST_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    }) as CaseField;

    component.caseField = FIRST_CASE_FIELD;
    fixture.detectChanges();
    component.ngOnInit();
    tick(1);
    // fixture.detectChanges();

    clickFirstElement(fixture);

    const dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    if (dayCells && dayCells[0]) {
      dayCells[0].nativeElement.click();
      fixture.detectChanges();
    }

    // check the new input against the first day of the month of the year in order to verify
    if (fixture.debugElement.query(By.css('.actions'))) {
      const confirm = fixture.debugElement.query(By.css('.actions')).nativeElement;
      confirm.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      if (initialDateTime.getDate() !== 1) {
        const initialFormattedDate = fixture.nativeElement.querySelector('.govuk-input').value;
        expect(initialFormattedDate).not.toBe(null);
        expectSeparatorCharacters(initialFormattedDate, '-', '+');
        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBe(null);
      }
    }

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to confirm datepicker concurs with formatting for field_type Date', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const firstDateEntryParameter = 'DD-MM-YYYY HH+mm+ss';
    const FIELD_TYPE_1: FieldType = {
      id: 'Date',
      type: 'Date'
    };

    const FIRST_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_1,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    }) as CaseField;

    component.caseField = FIRST_CASE_FIELD;
    fixture.detectChanges();
    component.ngOnInit();
    tick(1);
    // fixture.detectChanges();

    clickFirstElement(fixture);

    const dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    if (dayCells && dayCells[0]) {
      dayCells[0].nativeElement.click();
      fixture.detectChanges();
    }

    // check the new input against the first day of the month of the year in order to verify
    if (fixture.debugElement.query(By.css('.actions'))) {
      const confirm = fixture.debugElement.query(By.css('.actions')).nativeElement;
      confirm.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      if (initialDateTime.getDate() !== 1) {
        const initialFormattedDate = fixture.nativeElement.querySelector('.govuk-input').value;
        expect(initialFormattedDate).not.toBe(null);
        expectSeparatorCharacters(initialFormattedDate, '-', '+');
        expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBe(null);
      }
    }

    flush();
    discardPeriodicTasks();
  }));

  xit('should be able to change the selected time (hours and minutes)', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;
    const originalHourValue = +initialValue.substring(11, 13);
    const originalMinuteValue = +initialValue.substring(14, 16);

    const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const timeChanges = fixture.debugElement.queryAll(
      By.css('.mat-mdc-icon-button')
    );

    timeChanges[3].nativeElement.click();
    timeChanges[4].nativeElement.click();
    fixture.detectChanges();

    const confirm = fixture.debugElement.query(By.css('.mat-datepicker-actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    // check in order to verify the date has changed by one hour and one minute
    const oneHourAndMinuteChangeString = fixture.nativeElement.querySelector('input').value;
    const oneHourChangeValue = +oneHourAndMinuteChangeString.substring(11, 13);
    const oneMinuteChangeValue = +oneHourAndMinuteChangeString.substring(14, 16);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    // check verifies difference rather than change because tests were failing intermittently
    expect(oneHourChangeValue).not.toBe(originalHourValue);
    expect(oneMinuteChangeValue).not.toBe(originalMinuteValue);

    flush();
    discardPeriodicTasks();
  }));

  xit('should be able to change the selected time (hours) via AM and PM button', fakeAsync(() => {
    component.enableMeridian = true;
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;
    const originalHourValue = +initialValue.substring(11, 13);

    const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const meridian = fixture.debugElement.query(By.css('.meridian button')).nativeElement;

    const initialMeridian = meridian.innerText;

    meridian.click();
    fixture.detectChanges();

    expect(meridian.innerText).not.toBe(initialMeridian);

    const confirm = fixture.debugElement.query(By.css('.mat-datepicker-actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const meridianChangeString = fixture.nativeElement.querySelector('input').value;
    const meridianChangeValue = +meridianChangeString.substring(11, 13);

    // ensure that the hours are converted to the initial date
    const exactHourConversion = (meridianChangeValue + 12) % 24;
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    if (originalHourValue !== 12) {
      expect(originalHourValue).not.toBe(exactHourConversion);
    } else {
      expect(originalHourValue).toBe(meridianChangeValue);
    }

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the selected year, month and date (harness)', async () => {
    fixture.detectChanges();

    // set up loaders (root loader can see the CDK overlay)
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    // grab the input harness and open the calendar
    const input = await loader.getHarness(MatDatepickerInputHarness);
    const initialValue = await input.getValue();
    await input.openCalendar();

    // calendar is rendered in the overlay
    const calendar = await rootLoader.getHarness(MatCalendarHarness);

    // 1) Switch to multi-year view (click the period button)
    const periodBtn = await rootLoader.getHarness(
      MatButtonHarness.with({ selector: '.mat-calendar-period-button' })
    );
    await periodBtn.click();

    // 2) YEAR: pick the first enabled year that differs from current
    let cells = await calendar.getCells();
    // cells now represent YEARS in multi-year view
    const enabledYears = [];
    for (const c of cells) {
      if (!await c.isDisabled()) {
        enabledYears.push(c);
      }
    }
    expect(enabledYears.length).toBeGreaterThan(1);
    // pick the first enabled year
    await enabledYears[0].select();

    // 3) MONTH: after selecting a year, we are in year view (months)
    cells = await calendar.getCells();
    const enabledMonths = [];
    for (const c of cells) {
      if (!await c.isDisabled()) {
        enabledMonths.push(c);
      }
    }
    expect(enabledMonths.length).toBeGreaterThan(1);
    // choose the second enabled month (index 1 -> typically February)
    await enabledMonths[1].select();

    // 4) DAY: now we are in month view (days)
    cells = await calendar.getCells();
    const enabledDays = [];
    for (const c of cells) {
      if (!await c.isDisabled()) {
        enabledDays.push(c);
      }
    }
    expect(enabledDays.length).toBeGreaterThan(0);
    // pick the first enabled day (typically 1)
    await enabledDays[0].select();

    // 5) Confirm (if you show actions)
    const confirmBtn = await rootLoader.getHarness(
      MatButtonHarness.with({ selector: '.mat-datepicker-actions button' })
    );
    await confirmBtn.click();

    // assert the input changed and that it looks like a different date
    const finalValue = await input.getValue();
    expect(finalValue).toBeTruthy();
    expect(finalValue).not.toEqual(initialValue);

    // If your input shows DD/MM/YYYY, you can do a light parse to check “1st of month”
    const parts = finalValue.split('/');
    const dd = parseInt(parts[0], 10);
    expect(dd).toBe(1); // first day (since we chose the first enabled day)
  });

  it('should set the correct maximum and minimum', fakeAsync(() => {
    const miniDate = new Date('01-01-1500');
    const maxiDate = new Date('01-01-4000');
    const MIN_MAX_FIELD_TYPE: FieldType = {
      id: 'Date',
      type: 'DateTime',
      min: miniDate,
      max: maxiDate
    };
    const MIN_MAX_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: MIN_MAX_FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: initialDateEntryParameter
    }) as CaseField;

    expect(component.minDate(MIN_MAX_CASE_FIELD)).toEqual(miniDate);
    expect(component.maxDate(MIN_MAX_CASE_FIELD)).toEqual(maxiDate);
  }));

  it('should be able to confirm datepicker formatting is wrong', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const firstDateEntryParameter = 'DD MM YYYY HH+mm+ss';

    const FIRST_CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    }) as CaseField;

    fixture.detectChanges();
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();
    expect(FIRST_CASE_FIELD.dateTimeEntryFormat).not.toEqual(CUSTOM_MOMENT_FORMATS.parse.dateInput);
    flush();
    discardPeriodicTasks();
  }));

  it('should set the correct formatted value in dateControl on focusOut', () => {
    fixture.detectChanges();
    const inputValue = '2022-11-23T12:34:56.789';
    component.inputElement.nativeElement.value = inputValue;
    component.focusOut();

    const expectedFormattedValue = moment(inputValue).format('YYYY-MM-DDTHH:mm:ss.SSS');
    expect(component.dateControl.value).toEqual(expectedFormattedValue);
  });

  it('should set the correct formatted value in dateControl on focusOut', () => {
    fixture.detectChanges();
    const inputValue = '';
    component.inputElement.nativeElement.value = inputValue;
    component.focusOut();

    const expectedFormattedValue = moment(inputValue).format('YYYY-MM-DDTHH:mm:ss.SSS');
    expect(expectedFormattedValue).toEqual('Invalid date');
  });
});

function clickFirstElement(fixture: ComponentFixture<DatePickerComponent>) {
  const toggle = fixture.debugElement.query(By.css('#pickerOpener')).nativeElement;
  toggle.dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
  expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
  const dayCells = fixture.debugElement.queryAll(
    By.css('.mat-calendar-body-cell')
  );
  // get the collection of day buttons in order to click them
  dayCells[0].nativeElement.click();
  fixture.detectChanges();
  const confirm = fixture.debugElement.query(By.css('.mat-datepicker-actions button')).nativeElement;
  confirm.dispatchEvent(new MouseEvent('click'));
  fixture.detectChanges();
}

function expectSeparatorCharacters(checkedDate: string, firstChar: string, secondChar: string) {
  expect(checkedDate.substring(2, 3)).toBe(firstChar);
  expect(checkedDate.substring(5, 6)).toBe(firstChar);
  expect(checkedDate.substring(13, 14)).toBe(secondChar);
  expect(checkedDate.substring(16, 17)).toBe(secondChar);
}
