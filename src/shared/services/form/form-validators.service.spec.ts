import { AbstractControl, FormControl } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { aCaseField } from '../../fixture/shared.test.fixture';
import { FormValidatorsService } from './form-validators.service';

describe('FormValidatorsService', () => {

  const formValidatorsService: FormValidatorsService = new FormValidatorsService();

  it('should not add REQUIRED validator for OPTIONAL fields', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should validate for OPTIONAL fields', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('testing-optional.valid@test.com');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should return add REQUIRED validator for MANDATORY fields', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
  });

  it('should validate text field for MANDATORY with regular expression', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    caseField.field_type.regular_expression = '^(Test)$';
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('Test');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
    result.setValue(' ');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
    result.setValue(' Invalid  ');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
  });

  it('should validate text field for MANDATORY without regular expression', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('No regular expression, but valid');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
    result.setValue(' ');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
    result.setValue(' This text is valid. ');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeTruthy();
    result.setValue('#with Special_character_');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should validate text field for MANDATORY with min and max', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    caseField.field_type.min = 3;
    caseField.field_type.max = 9;
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('Hi');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
    result.setValue('');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
    result.setValue('Perfect');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
    result.setValue('Max reached');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeTruthy();
  });

  it('should validate text field for MANDATORY with email', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'label', 'Text', 'MANDATORY', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('testing-mandatory.valid@test.com');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });
});
