import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule }
  from '@angular-material-components/datetime-picker';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatetimePickerWrapperComponent } from './datetime-picker-wrapper.component';
import { By } from '@angular/platform-browser';

fdescribe('DatetimePickerWrapperComponent', () => {

  let component: DatetimePickerWrapperComponent;
  let fixture: ComponentFixture<DatetimePickerWrapperComponent>;

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
            DatetimePickerWrapperComponent,
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(DatetimePickerWrapperComponent);
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

  it('should create', fakeAsync(() => {
    expect(component).toBeDefined();
  }));

  it('should initialize with a date value', fakeAsync(() => {
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(null);
  }));

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

  it('should not open in disabled mode', fakeAsync(() => {
    component.disabled = true;
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
      
    component.datetimePicker.open();
    fixture.detectChanges();

    expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
  }));

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
 
    dayCells[0].nativeElement.click();
    fixture.detectChanges();

    let confirm = fixture.debugElement.query(By.css('.actions button')).nativeElement;
    confirm.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

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

    const date = new Date();
    const setDay = new Date(fixture.nativeElement.querySelector('input').value);
    const oneHourAndMinuteChange = new Date(date.getFullYear(), date.getMonth(), date.getDay(), date.getHours()+1, date.getMinutes()+1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getHours()).toBe(oneHourAndMinuteChange.getHours());
    expect(setDay.getMinutes()).toBe(oneHourAndMinuteChange.getMinutes());
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

    const originalDate = new Date(initialValue);
    const setDay = new Date(fixture.nativeElement.querySelector('input').value);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getSeconds()).toBe(originalDate.getSeconds()+3);
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

    const date = new Date();
    const setDay = new Date(fixture.nativeElement.querySelector('input').value);
    const oneHourAndMinuteChange = new Date(date.getFullYear(), date.getMonth(), date.getDay(), date.getHours()+1, date.getMinutes()+1);
    expect(fixture.nativeElement.querySelector('input').value).not.toBe(initialValue);
    expect(setDay.getHours()).toBe(oneHourAndMinuteChange.getHours());
    expect(setDay.getMinutes()).toBe(oneHourAndMinuteChange.getMinutes());
  });
});

