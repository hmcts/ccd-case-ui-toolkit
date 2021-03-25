import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule }
  from '@angular-material-components/datetime-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatetimePickerComponent } from './datetime-picker.component';
import { By } from '@angular/platform-browser';

describe('DatetimePickerComponent', () => {

  let component: DatetimePickerComponent;
  let fixture: ComponentFixture<DatetimePickerComponent>;

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
            ReactiveFormsModule
          ],
          declarations: [
            DatetimePickerComponent,
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(DatetimePickerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
  }));

  afterEach(fakeAsync(() => {
    component.datetimePicker.close();
    fixture.detectChanges();
    flush();
  }));

  // TODO: After working on other two relevant datetimepicker changes, will need to change tests
  // e.g. currently need format of date to properly check date

  it('should create', () => {
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
    const date = new Date();
    let setDay = new Date(fixture.nativeElement.querySelector('input').value);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getFullYear()).toBe(firstDay.getFullYear());
    expect(setDay.getMonth()).toBe(firstDay.getMonth());
    expect(setDay.getDay()).toBe(firstDay.getDay());
  });

  it('should be able to change the selected time (hours and minutes)', () => {
    const initialValue = fixture.nativeElement.querySelector('input').value;

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
    const initialDatetime = new Date(initialValue);
    const oneHourAndMinuteChange = new Date(fixture.nativeElement.querySelector('input').value);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(initialDatetime.getHours()).toBe(oneHourAndMinuteChange.getHours() - 1);
    expect(initialDatetime.getMinutes()).toBe(oneHourAndMinuteChange.getMinutes() - 1);
  });

  it('should be able to change the selected time (seconds)', () => {
    component.showSeconds = true;
    fixture.detectChanges();

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

    // check that the the amount of seconds is more than the original amount
    const originalDate = new Date(initialValue);
    let secondChange = new Date(fixture.nativeElement.querySelector('input').value).getSeconds();
    // ensure that the test does not fail due to minute changeover
    if (secondChange < 5) {
      secondChange += 60;
    }
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(secondChange > originalDate.getSeconds()).toBe(true);
  });

  it('should be able to change the selected time (hours) via AM and PM button', () => {
    component.enableMeridian = true;
    fixture.detectChanges();

    const initialValue = fixture.nativeElement.querySelector('input').value;

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

    const initialDate = new Date(initialValue);
    const meridianChange = new Date(fixture.nativeElement.querySelector('input').value);

    // ensure that the hours are converted to the initial date
    const exactHourConversion = (meridianChange.getHours() + 12) % 24;
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(initialDate.getHours()).toBe(exactHourConversion);
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
