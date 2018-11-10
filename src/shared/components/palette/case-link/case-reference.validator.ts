import {AbstractControl, ValidatorFn} from '@angular/forms';
import {FormValueService} from '../../../services/form/form-value.service';

export function CaseReferenceValidator(formValueService: FormValueService): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    if (control.value) {
      if (validUID(sanitise(control.value, formValueService))) {
        return null;
      }
      return {'error': ''};
    }
    return null;
  };

  function sanitise(reference: string, service: FormValueService): string {
    return service.sanitiseCaseReference(reference);
  }

  function validUID(valueString: string): boolean {
    if (!valueString || valueString.length !== 16) {
      return false;
    }
    const calculatedCheckDigit: number = checkSum(valueString);
    const inputCheckDigit: number = parseInt(valueString.charAt(15), 10);
    return calculatedCheckDigit === inputCheckDigit;
  }

  function checkSum(numberString: string): number {
    numberString = numberString.substring(0, 15);
    let isDouble = true;
    let sum = 0;
    for (let i = 14; i >= 0; i--) {
      const k: number = parseInt(numberString.charAt(i), 10);
      sum += sumToSingleDigit((k * (isDouble ? 2 : 1)));
      isDouble = !isDouble;
    }
    if ((sum % 10) > 0) {
      return 10 - (sum % 10);
    }
    return 0;
  }

  function sumToSingleDigit(k: number): number {
    if (k < 10) {
      return k;
    }
    return sumToSingleDigit(Math.floor(k / 10)) + (k % 10);
  }
}
