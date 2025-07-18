import { Component, forwardRef, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'cut-date-input',
  templateUrl: './date-input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateInputComponent),
      multi: true
    }
  ],
})
export class DateInputComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @Input()
  public id: string;

  @Input()
  public mandatory: boolean;

  @Input()
  public isDateTime: boolean;

  @Input()
  public formControl: FormControl;

  @Input()
  public isInvalid: boolean;

  public isTouched = false;
  public displayDay: string = null;
  public displayMonth: string = null;
  public displayYear: string = null;

  public displayHour: string = null;
  public displayMinute: string = null;
  public displaySecond: string = null;
  // Works with
  // 2018-04-09T08:02:27.542
  // 2018-04-09T08:02:27.542Z
  // 2018-04-09T08:02:27.542+01:00
  private readonly DATE_FORMAT =
    /^(19|20)\d{2}-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?|Z)?$/;
  //    year - month -  day     T   HH     :   MM      :  SS       .000        Z or +     01 :   00
  private propagateChange: (_: any) => {};
  private rawValue = '';
  private day: string;
  private month: string;
  private year: string;
  private hour: string;
  private minute: string;
  private second: string;

  public ngOnInit() {
    if (this.mandatory && this.isDateTime) {
      this.displayHour = '00';
      this.displayMinute = '00';
      this.displaySecond = '00';
      this.hour = '00';
      this.minute = '00';
      this.second = '00';
    }
  }

  public writeValue(obj: string): void { // 2018-04-09T08:02:27.542
    if (obj) {
      this.rawValue = this.removeMilliseconds(obj);
      // const date = new Date(this.rawValue);
      // const localDate = this.getOffsetDate(date);
      this.getLocalDateTimeString(this.rawValue);
      // needs to handle also partial dates, e.g. -05-2016 (missing day)
      // console.log('localDate:-', localDate);
      // console.log('localDate toISOString():-', localDate.toISOString());
      // const [datePart, timePart] = localDate.toISOString().split('T');
      // const dateValues = datePart.split('-');
      // this.year = this.displayYear = dateValues[0] || '';
      // this.month = this.displayMonth = dateValues[1] || '';
      // this.day = this.displayDay = dateValues[2] || '';
      // if (timePart) {
      //   const timeParts = timePart.split(':');
      //   this.hour = this.displayHour = timeParts[0] || '';
      //   this.minute = this.displayMinute = timeParts[1] || '';
      //   this.second = this.displaySecond = timeParts[2] || '';
      // }
    }
  }

  private getLocalDateTimeString(dateInput: string): void {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      // Not a valid date
      this.year = this.displayYear = '';
      this.month = this.displayMonth = '';
      this.day = this.displayDay = '';
      this.hour = this.displayHour = '';
      this.minute = this.displayMinute = '';
      this.second = this.displaySecond = '';
      return;
    }

    const localDate = this.getOffsetDate(date);
    this.year = this.displayYear = String(localDate.getFullYear());
    this.month = this.displayMonth = this.padZero(localDate.getMonth() + 1);
    this.day = this.displayDay = this.padZero(localDate.getDate());

    if (dateInput.includes('T')) {
      this.hour = this.displayHour = this.padZero(localDate.getHours());
      this.minute = this.displayMinute = this.padZero(localDate.getMinutes());
      this.second = this.displaySecond = this.padZero(localDate.getSeconds());
    } else {
      this.hour = this.displayHour = '';
      this.minute = this.displayMinute = '';
      this.second = this.displaySecond = '';
    }
  }

  private getOffsetDate(date: Date): Date {
    const localOffset = - date.getTimezoneOffset() / 60;
    return new Date(date.getTime() + localOffset * 3600 * 1000);
  }

  public validate(control: AbstractControl): ValidationErrors {
    if (this.mandatory && !this.viewValue()) {
      return {
        required: 'This field is required'
      };
    }
    if (control.value && !this.isDateFormat(this.getValueForValidation(control))) {
      return {
        pattern: 'Date is not valid'
      };
    }
    return undefined;
  }

  public registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  public registerOnTouched(fn: any): void {
    // Do nothing.
  }

  public ngOnDestroy() {
    this.validate = (control: AbstractControl): ValidationErrors => {
      return undefined;
    };
  }

  public dayChange(value: string) {
    // get value from input
    this.day = value;
    const [datePart, timePart] = this.rawValue.split('T');

    this.rawValue = this.isDateFormat(this.viewValue()) && timePart ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);
  }

  public monthChange(value: string) {
    // get value from input
    this.month = value;
    const [datePart, timePart] = this.rawValue.split('T');
    // this.rawValue = this.convertToUTC(this.viewValue());
    this.rawValue = this.isDateFormat(this.viewValue()) && timePart ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);

  }

  public yearChange(value: string) {
    // get value from input
    this.year = value;
    const [datePart, timePart] = this.rawValue.split('T');
    // this.rawValue = this.convertToUTC(this.viewValue());
    this.rawValue = this.isDateFormat(this.viewValue()) && timePart ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);
  }

  public hourChange(value: string) {
    // get value from input
    this.hour = value;

    // this.rawValue = this.convertToUTC(this.viewValue());
    this.rawValue = this.isDateFormat(this.viewValue()) ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.viewValue();
    console.log('hours change value', this.rawValue);
    // update the form
    this.propagateChange(this.rawValue);
  }

  public minuteChange(value: string) {
    // get value from input
    this.minute = value;

    // this.rawValue = this.convertToUTC(this.viewValue());
    this.rawValue = this.isDateFormat(this.viewValue()) ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.viewValue();
    console.log('minute change value', this.rawValue);

    // update the form
    this.propagateChange(this.rawValue);

  }

  public secondChange(value: string) {
    // get value from input
    this.second = value;

    // this.rawValue = this.viewValue();
    this.rawValue = this.isDateFormat(this.viewValue()) ? this.convertToUTC(this.viewValue()) : this.viewValue();
    // this.rawValue = this.convertToUTC(this.viewValue());

    // update the form
    this.propagateChange(this.rawValue);
  }

  public inputFocus() {
    this.isTouched = false;
    this.touch();
  }

  public touch() {
    if (this.isTouched) {
      this.formControl.markAsTouched();
      this.propagateChange(this.rawValue);
    } else {
      this.formControl.markAsUntouched();
    }
  }

  public dayId() {
    return this.id + '-day';
  }

  public monthId() {
    return this.id + '-month';
  }

  public yearId() {
    return this.id + '-year';
  }

  public hourId() {
    return this.id + '-hour';
  }

  public minuteId() {
    return this.id + '-minute';
  }

  public secondId() {
    return this.id + '-second';
  }

  private isValidDateTime(input: string): boolean {
    const date = new Date(input);
    return this.isDateFormat(date.getTime());
  }
  private convertToUTC(input: string): string | null {
    if (!input) return null;

    const date = new Date(input);
    if (isNaN(date.getTime())) return null; // Invalid date

    const year = date.getUTCFullYear();
    const month = this.padZero(date.getUTCMonth() + 1);
    const day = this.padZero(date.getUTCDate());
    const hour = this.padZero(date.getUTCHours());
    const minute = this.padZero(date.getUTCMinutes());
    const second = this.padZero(date.getUTCSeconds());
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0');

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
  }

  private padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private viewValue(): string {
    if (this.day || this.month || this.year || this.hour || this.minute || this.second) {
      const date = [
        this.year ? this.year : '',
        this.month ? this.pad(this.month) : '',
        this.day ? this.pad(this.day) : ''
      ].join('-');
      if (this.isDateTime) {
        const time = [
          this.hour ? this.pad(this.hour) : '',
          this.minute ? this.pad(this.minute) : '',
          this.second ? this.pad(this.second) : ''
        ].join(':');
        return `${date}T${time}.000`;
      } else {
        return date;
      }
    }
    return null;
  }

  private isDateFormat(val: any): boolean {
    return this.DATE_FORMAT.test(val);
  }

  private pad(num: any, padNum = 2): string {
    const val = num !== undefined ? num.toString() : '';
    return val.length >= padNum ? val : new Array(padNum - val.length + 1).join('0') + val;
  }

  private getValueForValidation(control: any) {
    if (this.isDateTime) {
      return control.value;
    } else {
      return control.value.replace(/Z.*/, 'T00:00:00Z');
    }
  }

  private removeMilliseconds(dateTime: string): string {
    return dateTime.replace(/\..*/, '');
  }
}
