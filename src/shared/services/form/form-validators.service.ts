import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Constants } from '../../commons/constants';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FormValidatorsService {

  private static readonly CUSTOM_VALIDATED_TYPES: FieldTypeEnum[] = [
    'Date', 'MoneyGBP', 'Label'
  ];
  public static addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    if (
      caseField.display_context === Constants.MANDATORY &&
      FormValidatorsService.CUSTOM_VALIDATED_TYPES.indexOf(caseField.field_type.type) === -1
      ) {
      const validators = [Validators.required];
      if (caseField.field_type.type === 'Text') {
        if (caseField.field_type.regular_expression) {
          validators.push(Validators.pattern(caseField.field_type.regular_expression));
        } else {
          validators.push(this.emptyValidator());
        }
        if (caseField.field_type.min && (typeof caseField.field_type.min === 'number')) {
          validators.push(Validators.minLength(caseField.field_type.min));
        }
        if (caseField.field_type.max && (typeof caseField.field_type.max === 'number')) {
          validators.push(Validators.maxLength(caseField.field_type.max));
        }
      }
      if (control.validator) {
        validators.push(control.validator);
      }
      control.setValidators(validators);
    }
    return control;
  }

  public static emptyValidator(): ValidatorFn {
    const validator = (control: AbstractControl):ValidationErrors | null =>  {
     if (control && control.value && control.value.toString().trim().length === 0) {
        return  { required: {} };
      }
      return null;
    };
    return validator;
  }

  // TODO: Strip this out as it's only here for the moment because
  // the service is being injected all over the place but it doesn't
  // need to be as FormValidatorsService.addValidators is perfectly
  // happy being static.
  public addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    return FormValidatorsService.addValidators(caseField, control);
  }
}
