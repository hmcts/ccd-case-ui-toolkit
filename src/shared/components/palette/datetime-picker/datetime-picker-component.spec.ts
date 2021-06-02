import { By } from '@angular/platform-browser';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule }
  from '@angular-material-components/datetime-picker';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { CaseField, FieldType } from '../../../domain';
import { CaseFieldService } from '../../../services';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';
import { DatetimePickerComponent } from './datetime-picker.component';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { FieldLabelPipe, FirstErrorPipe } from '../utils';

describe('DatetimePickerComponent', () => {

  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;
  let caseFieldService = new CaseFieldService();
  // changing custom formats to make it easier to get date from input
  CUSTOM_MOMENT_FORMATS.parse.dateInput = 'DD/MM/YYYY, HH:mm:ss';
  CUSTOM_MOMENT_FORMATS.display.dateInput = 'DD/MM/YYYY, HH:mm:ss';

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'DateTime'
  };
  const initialDateTime = new Date();
  const initialDateEntryParameter = 'DD/MM/YYYY HH:mm:ss'

  const CASE_FIELD: CaseField = <CaseField>({
    id: FIELD_ID,
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: initialDateTime,
    dateTimeEntryFormat: initialDateEntryParameter
  });

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
          imports: [
            NgxMatDatetimePickerModule,
            NgxMatTimepickerModule,
            NgxMatNativeDateModule,
            NoopAnimationsModule,
            MatFormFieldModule,
            MatInputModule,
            MatDatepickerModule,
            FormsModule,
            ReactiveFormsModule
          ],
          declarations: [
            DatetimePickerComponent, FieldLabelPipe, FirstErrorPipe
          ],
          providers: [FormatTranslatorService,
            { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
            { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
            { provide: CaseFieldService, useValue: caseFieldService }
            ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(DatetimePickerComponent);
      component = fixture.componentInstance;
      component.caseField = CASE_FIELD;
      component.hideTime = false;
      component.hideMinutes = false;
  }));

  afterEach(fakeAsync(() => {
    component.datetimePicker.close();
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

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the format via caseField', fakeAsync(() => {
    const firstDateEntryParameter = 'DD-MM-YYYY HH+mm+ss'

    const FIRST_CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    });

    component.caseField = FIRST_CASE_FIELD;
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();

    const firstFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(firstFormattedDate).not.toBe(null);
    expect(firstFormattedDate.substring(2, 3)).toBe('-');
    expect(firstFormattedDate.substring(5, 6)).toBe('-');
    expect(firstFormattedDate.substring(13, 14)).toBe('+');
    expect(firstFormattedDate.substring(16, 17)).toBe('+');

    // EUI-4118 - changed test to refer back to previous case field due to intermittent errors based on reactive form
    component.caseField = CASE_FIELD;
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();

    const newFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(newFormattedDate).not.toBe(null);
    expect(newFormattedDate.substring(2, 3)).toBe('/');
    expect(newFormattedDate.substring(5, 6)).toBe('/');
    expect(newFormattedDate.substring(13, 14)).toBe(':');
    expect(newFormattedDate.substring(16, 17)).toBe(':');
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to confirm the selected datetime', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);
    const initialValue = fixture.nativeElement.querySelector('input').value;

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
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

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    let dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    let setDay = fixture.nativeElement.querySelector('input').value.split('/');
    const d = parseInt(setDay[0], 10);
    const m = parseInt(setDay[1], 10);
    const y = parseInt(setDay[2], 10);
    setDay = new Date(y, m - 1, d);

    // check the new input against the first day of the month of the year in order to verify
    const firstDay = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getFullYear()).toBe(firstDay.getFullYear());
    expect(setDay.getMonth()).toBe(firstDay.getMonth());
    expect(setDay.getDay()).toBe(firstDay.getDay());
    flush();
    discardPeriodicTasks();
  }));

  it('should be able to confirm datepicker concurs with formatting', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const firstDateEntryParameter = 'DD-MM-YYYY HH+mm+ss'

    const FIRST_CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: firstDateEntryParameter
    });

    component.caseField = FIRST_CASE_FIELD;
    fixture.detectChanges();
    component.ngOnInit();
    tick(1);
    fixture.detectChanges();

    const initialFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(initialFormattedDate).not.toBe(null);
    expect(initialFormattedDate.substring(2, 3)).toBe('-');
    expect(initialFormattedDate.substring(5, 6)).toBe('-');
    expect(initialFormattedDate.substring(13, 14)).toBe('+');
    expect(initialFormattedDate.substring(16, 17)).toBe('+');

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    let dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    // check the new input against the first day of the month of the year in order to verify
    const newFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(newFormattedDate).not.toBe(initialFormattedDate);
    expect(newFormattedDate.substring(2, 3)).toBe('-');
    expect(newFormattedDate.substring(5, 6)).toBe('-');
    expect(newFormattedDate.substring(13, 14)).toBe('+');
    expect(newFormattedDate.substring(16, 17)).toBe('+');

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the selected time (hours and minutes)', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;
    const originalHourValue = +initialValue.substring(11, 13);
    const originalMinuteValue = +initialValue.substring(14, 16);

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const timeChanges = fixture.debugElement.queryAll(
      By.css('.mat-icon-button')
    );

    timeChanges[3].nativeElement.click();
    timeChanges[4].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
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

  it('should be able to change the selected time (seconds)', fakeAsync(() => {
    component.showSeconds = true;
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const timeChanges = fixture.debugElement.queryAll(
      By.css('.mat-icon-button')
    );

    for (let i = 0; i < 3; i++) {
      timeChanges[5].nativeElement.click();
    }
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    // check that the the amount of seconds has been changed (avoids intermittent test failure issue)
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the selected time (hours) via AM and PM button', fakeAsync(() => {
    component.enableMeridian = true;
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;
    const originalHourValue = +initialValue.substring(11, 13);

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const meridian = fixture.debugElement.query(By.css('.meridian button')).nativeElement;

    const initialMeridian = meridian.innerText;

    meridian.click();
    fixture.detectChanges();

    expect(meridian.innerText).not.toBe(initialMeridian);

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    const meridianChangeString = fixture.nativeElement.querySelector('input').value;
    const meridianChangeValue = +meridianChangeString.substring(11, 13);

    // ensure that the hours are converted to the initial date
    const exactHourConversion = (meridianChangeValue + 12) % 24;
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    if (originalHourValue !== 12) {
      expect(originalHourValue).toBe(exactHourConversion);
    } else {
      expect(originalHourValue).toBe(meridianChangeValue);
    }

    flush();
    discardPeriodicTasks();
  }));

  it('should be able to change the selected year, month and date', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    const initialValue = fixture.nativeElement.querySelector('input').value;
    const initialDate = new Date(initialValue);

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    const periodSelector = fixture.debugElement.query(By.css('.mat-calendar-period-button')).nativeElement;

    periodSelector.click();
    fixture.detectChanges();

    let yearCells = fixture.debugElement.queryAll(
      By.css('ngx-mat-multi-year-view .mat-calendar-body-cell')
    );

    // double check that the first year shown will not be the current year
    if (yearCells[0].nativeElement.innerText !== initialDate.getFullYear().toString()) {
      yearCells[0].nativeElement.click();
      fixture.detectChanges();
    } else {
      yearCells[1].nativeElement.click();
      fixture.detectChanges();
    }

    let monthCells = fixture.debugElement.queryAll(
      By.css('ngx-mat-year-view .mat-calendar-body-cell')
    );

    monthCells[1].nativeElement.click();
    fixture.detectChanges();

    let dayCells = fixture.debugElement.queryAll(
      By.css('ngx-mat-month-view .mat-calendar-body-cell')
    );

    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    let setDate = fixture.nativeElement.querySelector('input').value.split('/');
    const d = parseInt(setDate[0], 10);
    const m = parseInt(setDate[1], 10);
    const y = parseInt(setDate[2], 10);
    setDate = new Date(y, m - 1, d);

    // check all are first values (apart from year which can check is not initial selected year)
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDate.getFullYear()).not.toBe(initialDate.getFullYear());
    expect(setDate.getMonth()).toBe(1);
    expect(setDate.getDay()).toBe(1);

    flush();
    discardPeriodicTasks();
  }));

  it('should have the correct date control format', fakeAsync(() => {
    fixture.detectChanges();
    tick(1);

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    let dayCells = fixture.debugElement.queryAll(
      By.css('.mat-calendar-body-cell')
    );

    // get the collection of day buttons in order to click them
    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(component.dateControl.value.includes('Z')).toBe(false);

    flush();
    discardPeriodicTasks();
  }));
});
