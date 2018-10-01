import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';

@Component({
  selector: 'ccd-money-gbp-input',
  template: `<input class="form-control form-control-1-8"
                    type="text"
                    [id]="id"
                    [name]="name"
                    [value]="displayValue"
                    (change)="onChange($event)"
                    (keyup)="onChange($event)"
                    (blur)="onBlur()"
                    [disabled]="disabled"/>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MoneyGbpInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MoneyGbpInputComponent),
      multi: true,
    }
  ]
})
export class MoneyGbpInputComponent implements ControlValueAccessor, Validator {

  private static readonly PATTERN = '^\d*(\.\d{0,2})?$';
  private static readonly PATTERN_REGEXP = new RegExp(MoneyGbpInputComponent.PATTERN);

  @Input()
  id: string;

  @Input()
  name: string;

  @Input()
  mandatory: boolean;

  @Input()
  formControl: FormControl;

  private rawValue: number;
  public displayValue: string = null;
  public disabled: boolean;

  // change events from the textarea
  onChange(event) {

    // get value from input
    let newValue = event.target.value;

    if (newValue && MoneyGbpInputComponent.PATTERN_REGEXP.test(newValue)) {
      let parts = newValue.split('.');

      if (!parts[1]) {
        parts[1] = '00';
      } else {
        while (2 > parts[1].length) {
          parts[1] += '0';
        }
      }

      this.rawValue = parts.join('');
    } else {
      // When pattern not matched, value is passed as is so that it fails validation.
      this.rawValue = newValue;
    }

    // update the form
    this.propagateChange(this.rawValue);
  }

  writeValue(obj: any): void {
    if (obj) {
      this.rawValue = obj;

      let integerPart = obj.slice(0, -2) || '0';
      let decimalPart = obj.slice(-2);

      while (2 > decimalPart.length) {
        decimalPart += '0';
      }

      this.displayValue = [integerPart, decimalPart].join('.');
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(_: any): void {
    // Not used.
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private propagateChange = (_: any) => { };

  onBlur() {
    this.formControl.markAsTouched();
    this.propagateChange(this.rawValue);
  }

  validate(control: FormControl): ValidationErrors {
    if (this.mandatory && !control.value) {
      return {
        pattern: 'This field is required'
      };
    }
    if (control.value && !MoneyGbpInputComponent.PATTERN_REGEXP.test(control.value)) {
      return {
        pattern: 'Should only contain numbers with up to 2 decimal places'
      };
    }
    return undefined;
  }

  registerOnValidatorChange(_: () => void): void {
    // Not used.
  }
}
