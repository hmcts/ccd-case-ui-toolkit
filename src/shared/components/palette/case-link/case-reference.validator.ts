import { AbstractControl, ValidatorFn } from '@angular/forms';

export function CaseReferenceValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    if (control.value) {
      if ( validCaseReference(control.value) ) {
        return null;
      }
      return {'error': 'Please use a valid 16 Digit Case Reference'};
    }
    return null;
  };

  function validCaseReference(valueString: string): boolean {
    if (!valueString )  {
      return false;
    }
    return new RegExp('^\\b\\d{4}[ -]?\\d{4}[ -]?\\d{4}[ -]?\\d{4}\\b$').test(valueString);
  }
}
