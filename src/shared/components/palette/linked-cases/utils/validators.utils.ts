import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorsUtils {
  public numberLengthValidator(inputLength: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return control.value.length !== inputLength ? { isValid: false } : null;
    };
  }
  public formArraySelectedValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return control.value.every((option) => !option.selected) ? { isValid: false } : null;
    };
  }
}

