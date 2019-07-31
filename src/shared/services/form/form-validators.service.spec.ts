import { FormValidatorsService } from './form-validators.service';
import { CaseField } from '../../domain/definition/case-field.model';
import { FormControl } from '@angular/forms';
import { newCaseField, textFieldType } from '../../fixture';

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

  it('should validate for OPTIONAL fields', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', 'Text', textFieldType(), 'OPTIONAL', null).build();
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('testing-optional.valid@test.com');
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

  it('should validate text field for MANDATORY with regular expression', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', 'Text', textFieldType(), 'MANDATORY', null).build();
    caseField.field_type.regular_expression = '^(Test)$';
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
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
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', 'Text', textFieldType(), 'MANDATORY', null).build();
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('No regular expression, but valid');
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
    result.setValue('#with Special_character_');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });

  it('should validate text field for MANDATORY with min and max', () => {
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField ('id', 'label', 'Text', textFieldType() , 'MANDATORY', null).build();
    caseField.field_type.min = 3;
    caseField.field_type.max = 9;
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
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
    let formControl: FormControl = new FormControl();
    let caseField: CaseField = newCaseField('id', 'label', 'Text', textFieldType(), 'MANDATORY', null).build();
    let result: FormControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('testing-mandatory.valid@test.com');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.invalid).toBeFalsy();
  });
});
