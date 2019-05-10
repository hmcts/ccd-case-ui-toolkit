import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FormControl, Validators } from '@angular/forms';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';
import { Constants } from '../../commons/constants';

@Injectable()
export class FormValidatorsService {
  static readonly MANDATORY: string = 'MANDATORY';
  static readonly REGEX_WHITESPACES: string = '^[^ ]+(?:\\s+[^ ]+)*$';

  private readonly CUSTOM_VALIDATED_TYPES: FieldTypeEnum[] = [
    'Date', 'MoneyGBP'
  ];

  addValidators(caseField: CaseField, control: FormControl): FormControl {
    if (caseField.display_context === Constants.MANDATORY
      && this.CUSTOM_VALIDATED_TYPES.indexOf(caseField.field_type.type) === -1) {
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
}
