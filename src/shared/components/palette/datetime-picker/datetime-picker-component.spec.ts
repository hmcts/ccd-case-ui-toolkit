import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule }
  from '@angular-material-components/datetime-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatetimePickerComponent } from './datetime-picker.component';
import { By } from '@angular/platform-browser';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { NGX_MAT_DATE_FORMATS } from '@angular-material-components/datetime-picker';
import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';
import { FieldLabelPipe, FirstErrorPipe, PaletteUtilsModule } from '../utils';
import { CaseFieldService } from '../../../services';
import { FormModule } from '../../../../components/form/form.module';
import { CaseField, FieldType } from '../../../domain';

describe('DatetimePickerComponent', () => {

  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;
  let caseFieldService = new CaseFieldService();
  // changing custom formats to make it easier to get date from input
  CUSTOM_MOMENT_FORMATS.parse.dateInput = 'MM/DD/YYYY, HH:mm:SS';
  CUSTOM_MOMENT_FORMATS.display.dateInput = 'MM/DD/YYYY, HH:mm:SS';

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'DateTime'
  };
  const initialDateTime = new Date();
  const initialDateEntryParameter = 'MM/DD/YYYY HH:mm:SS'

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
      fixture.detectChanges();
  }));

  afterEach(fakeAsync(() => {
    component.datetimePicker.close();
    fixture.detectChanges();
    flush();
  }));

  // TODO: After working on other two relevant datetimepicker changes, will need to change tests
  // e.g. currently need format of date to properly check date

  it('should create with no issuee via constructor', () => {
    expect(component).toBeDefined();
  });

  it('should initialize with a date value', () => {
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(null);
  });

  it('should open view when datetime picker opened', () => {
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

    component.datetimePicker.open();
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
  });

  it('should open view when toggle clicked', () => {
    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).toBeNull();

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();
  });

  it('should be able to change the format via caseField', () => {
    const firstDateEntryParameter = 'MM-DD-YYYY HH+mm+SS'

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
    fixture.detectChanges();

    const firstFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(firstFormattedDate).not.toBe(null);
    expect(firstFormattedDate.substring(2, 3)).toBe('-');
    expect(firstFormattedDate.substring(5, 6)).toBe('-');
    expect(firstFormattedDate.substring(13, 14)).toBe('+');
    expect(firstFormattedDate.substring(16, 17)).toBe('+');

    const secondDateEntryParameter = 'HH+mm+SS YY*MM*DD'

    const SECOND_CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: initialDateTime,
      dateTimeEntryFormat: secondDateEntryParameter
    });

    component.caseField = SECOND_CASE_FIELD;
    component.ngOnInit();
    fixture.detectChanges();

    const newFormattedDate = fixture.nativeElement.querySelector('input').value;
    expect(newFormattedDate).not.toBe(null);
    expect(newFormattedDate.substring(2, 3)).toBe('+');
    expect(newFormattedDate.substring(5, 6)).toBe('+');
    expect(newFormattedDate.substring(11, 12)).toBe('*');
    expect(newFormattedDate.substring(14, 15)).toBe('*');
  });

  it('should not open in disabled mode', () => {
    component.disabled = true;
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

    component.datetimePicker.open();
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  });

  it('should be able to confirm the selected datetime', () => {
    const initialValue = fixture.nativeElement.querySelector('input').value;

    let toggle = fixture.debugElement.query(By.css('mat-datepicker-toggle#pickerOpener button')).nativeElement;
    toggle.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane.mat-datepicker-popup')).not.toBeNull();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input').value).toBe(initialValue);
  });

  it('should be able to change the selected date', () => {
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

    // check the new input against the first day of the month of the year in order to verify
    let setDay = new Date(fixture.nativeElement.querySelector('input').value);
    const firstDay = new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getFullYear()).toBe(firstDay.getFullYear());
    expect(setDay.getMonth()).toBe(firstDay.getMonth());
    expect(setDay.getDay()).toBe(firstDay.getDay());
  });

  it('should be able to change the selected format via dateTimeEntryFormat and confirm datepicker concurs with formatting', () => {
    const firstDateEntryParameter = 'MM-DD-YYYY HH+mm+SS'

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
  });

  it('should be able to change the selected time (hours and minutes)', () => {
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
    if (oneHourChangeValue !== 0) {
      expect(oneHourChangeValue > originalHourValue).toBe(true);
    } else {
      expect(originalHourValue === 23).toBe(true);
    }
    // checks less than two as there are issues at end of minutes where datetime picker initialises and sets different minute values
    if (oneMinuteChangeValue < 2) {
      expect(oneMinuteChangeValue > originalMinuteValue).toBe(true);
    }
  });

  it('should be able to change the selected time (seconds)', () => {
    component.showSeconds = true;
    fixture.detectChanges();

    const initialValue = fixture.nativeElement.querySelector('input').value;
    let originalSeconds = +initialValue.substring(18);

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

    // check that the the amount of seconds is more than the original amount
    const secondChangeString = fixture.nativeElement.querySelector('input').value;
    let secondChange: number = +secondChangeString.substring(18);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(secondChange).not.toBe(originalSeconds);
  });

  it('should be able to change the selected time (hours) via AM and PM button', () => {
    component.enableMeridian = true;
    fixture.detectChanges();

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
  });

  it('should be able to change the selected year, month and date', () => {
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

    // check all are first values (apart from year which can check is not initial selected year)
    let setDate = new Date(fixture.nativeElement.querySelector('input').value);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDate.getFullYear()).not.toBe(initialDate.getFullYear());
    expect(setDate.getMonth()).toBe(1);
    expect(setDate.getDay()).toBe(1);
  });
});
