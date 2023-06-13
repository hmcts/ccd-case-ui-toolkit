import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ccd-query-write-date-input',
  templateUrl: './query-write-date-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QueryWriteDateInputComponent),
      multi: true
    }
  ]
})
export class QueryWriteDateInputComponent implements ControlValueAccessor {
  @Input() public formControlName: string;
  public day: number;
  public month: number;
  public year: number;
  public disabled = false;
  private onChange: (value: Date) => void;
  private onTouched: () => void;

  public writeValue(date: Date): void {
    if (date instanceof Date && !isNaN(date.getTime())) {
      this.day = date.getDate();
      this.month = date.getMonth() + 1; // Months are zero-based
      this.year = date.getFullYear();
    } else {
      this.day = null;
      this.month = null;
      this.year = null;
    }
  }

  public registerOnChange(fn: (value: Date) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public updateDate(): void {
    const updatedValue = this.onChange && this.isValidDateInput() ?
      new Date(this.year, this.month - 1, this.day)
      : null;

    this.onChange(updatedValue);
    this.onTouched();
  }

  private isValidDateInput(): boolean {
    const isValidDay = this.day >= 1 && this.day <= 31;
    const isValidMonth = this.month >= 1 && this.month <= 12;
    const isValidYear = this.year >= 0;

    return isValidDay && isValidMonth && isValidYear;
  }
}
