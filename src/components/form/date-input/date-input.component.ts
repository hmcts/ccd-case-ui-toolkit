import {Component, forwardRef, Input, OnDestroy} from '@angular/core';
import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';

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
export class DateInputComponent implements ControlValueAccessor, Validator, OnDestroy {
  @Input()
  public id: string;

  @Input()
  public mandatory: boolean;

  @Input()
  public formControl: FormControl;

  public displayDay: string = null;
  public displayMonth: string = null;
  public displayYear: string = null;

  // tslint:disable-next-line
  private readonly DATE_FORMAT = /^(\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

  private propagateChange: (_: any) => {};
  private rawValue: string = '';
  private day: string;
  private month: string;
  private year: string;

  public writeValue(obj: string): void {
    if (obj) {
      this.rawValue = obj.replace(/T.*/, '');

      // needs to handle also partial dates, e.g. -05-2016 (missing day)
      const values = this.rawValue.split('-');
      this.year = this.displayYear = values[0] || '';
      this.month = this.displayMonth = values[1] || '';
      this.day = this.displayDay = values[2] || '';
    }
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

  public dayChange(event: any) {
    // get value from input
    this.day = event.target.value;

    this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);
  }

  public monthChange(event: any) {
    // get value from input
    this.month = event.target.value;

    this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);

  }

  public yearChange(event: any) {
    // get value from input
    this.year = event.target.value;

    this.rawValue = this.viewValue();

    // update the form
    this.propagateChange(this.rawValue);
  }

  public inputBlur() {
    this.formControl.markAsTouched();
    this.propagateChange(this.rawValue);
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

  private viewValue(): string {
    if (this.day || this.month || this.year) {
      return [
        this.year ? this.year : '',
        this.month ? this.pad(this.month) : '',
        this.day ? this.pad(this.day) : ''
      ].join('-');
    }
    return null;
  }

  private isDateFormat(val: any): boolean {
    return this.DATE_FORMAT.test(val);
  }

  private pad(num: any, padNum: number = 2): string {
    const val = num !== undefined ? num.toString() : '';
    return val.length >= padNum ? val : new Array(padNum - val.length + 1).join('0') + val;
  }

  private getValueForValidation(control: any) {
    return control.value.replace(/Z.*/, 'T00:00:00Z');
  }
}
