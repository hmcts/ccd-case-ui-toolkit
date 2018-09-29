import { FormValidatorsService } from './form-validators.service';
import { CaseField } from '../../shared/domain/definition/case-field.model';
import { aCaseField } from '../../shared/case-editor/case-edit.spec';
import { FormControl } from '@angular/forms';

describe('FormValidatorsService', () => {

  let formValidatorsService: FormValidatorsService = new FormValidatorsService();

  it('should not add REQUIRED validator for OPTIONAL fields', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = aCaseField('id', 'label', 'Text', 'OPTIONAL', null);
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should return add REQUIRED validator for MANDATORY fields', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
  });
});
