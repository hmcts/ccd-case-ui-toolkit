import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FormControl, Validators } from '@angular/forms';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FormValidatorsService {
  static readonly MANDATORY: string = 'MANDATORY';
  private readonly CUSTOM_VALIDATED_TYPES: FieldTypeEnum[] = [
    'Date', 'MoneyGBP'
  ];

  addValidators(caseField: CaseField, control: FormControl): FormControl {
    if (caseField.display_context === FormValidatorsService.MANDATORY
      && this.CUSTOM_VALIDATED_TYPES.indexOf(caseField.field_type.type) === -1) {
      let validators = [Validators.required];
      if (control.validator) {
        validators.push(control.validator);
      }
      control.setValidators(validators);
    }
    return control;
  }
}
