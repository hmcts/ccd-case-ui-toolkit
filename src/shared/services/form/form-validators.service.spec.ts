import { FormValidatorsService } from './form-validators.service';
import { CaseField } from '../../domain/definition/case-field.model';
import { FormControl } from '@angular/forms';
import { newCaseField } from '../../fixture';

describe('FormValidatorsService', () => {

  let formValidatorsService: FormValidatorsService = new FormValidatorsService();

  it('should not add REQUIRED validator for OPTIONAL fields', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', null, null, 'OPTIONAL', null).build();
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should return add REQUIRED validator for MANDATORY fields', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', null, null, 'MANDATORY', null).build();
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
  });
});
