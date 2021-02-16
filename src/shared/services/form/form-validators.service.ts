import { Injectable } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';

import { Constants } from '../../commons/constants';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FormValidatorsService {

  private static CUSTOM_VALIDATED_TYPES: FieldTypeEnum[] = [
    'Date', 'MoneyGBP', 'Label'
  ];

  public static addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    if (
      caseField.display_context === Constants.MANDATORY &&
      FormValidatorsService.CUSTOM_VALIDATED_TYPES.indexOf(caseField.field_type.type) === -1
      ) {
      let validators = [Validators.required];
      if (caseField.field_type.type === 'Text') {
        if (caseField.field_type.regular_expression) {
          validators.push(Validators.pattern(caseField.field_type.regular_expression));
        } else {
          validators.push(Validators.pattern(Constants.REGEX_WHITESPACES));
        }
        if (caseField.field_type.min) {
          validators.push(Validators.minLength(caseField.field_type.min));
        }
        if (caseField.field_type.max) {
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

  // TODO: Strip this out as it's only here for the moment because
  // the service is being injected all over the place but it doesn't
  // need to be as FormValidatorsService.addValidators is perfectly
  // happy being static.
  public addValidators(caseField: CaseField, control: AbstractControl): AbstractControl {
    return FormValidatorsService.addValidators(caseField, control);
  }
}
