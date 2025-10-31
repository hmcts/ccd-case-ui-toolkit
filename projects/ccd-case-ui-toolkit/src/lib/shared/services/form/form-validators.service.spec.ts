import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
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

  it('should return add Markdown validator for MANDATORY fields', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'Text', 'MANDATORY', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('[Test](www.google.com)');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should return add Markdown validator for OPTIONAL fields', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('[Test](www.google.com)');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should return add Markdown validator for OPTIONAL fields - TextArea', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'TextArea', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('[Test](www.google.com)');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should return add Markdown validator for MANDATORY fields - TextArea', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'TextArea', 'MANDATORY', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('[Test](www.google.com)');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should add Markdown validator for the specified control path', () => {
    const formGroup = new FormGroup({
      summary: new FormControl(),
      description: new FormControl()
    });

    const controlPath = 'summary';
    const result = formValidatorsService.addMarkDownValidators(formGroup, controlPath);

    result.setValue('[Test](www.google.com)');
    result.markAsTouched();
    result.updateValueAndValidity();

    expect(result.valid).toBeFalsy();
  });

  it('should invalidate value containing <script> tag', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('<script>alert(1)</script>');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should invalidate value containing incomplete <script tag', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'TextArea', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('<script src="x.js"');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should invalidate value containing inline event handler attribute', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('<div onclick="doSomething()">Test</div>');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeFalsy();
  });

  it('should allow similar text without angle brackets or handlers', () => {
    const formControl: FormControl = new FormControl();
    const caseField: CaseField = aCaseField('id', 'Label', 'Text', 'OPTIONAL', null);
    const result: AbstractControl = formValidatorsService.addValidators(caseField, formControl);
    result.setValue('script alert(1) onclick test');
    result.markAsTouched();
    result.updateValueAndValidity();
    expect(result.valid).toBeTruthy();
  });

  describe('Extended markdown/script regex coverage', () => {
    function validatorOnly(): (value: string) => boolean {
      const v = FormValidatorsService.markDownPatternValidator();
      return (value: string) => v(new FormControl(value)) !== null; // true if invalid
    }
    const isInvalid = validatorOnly();

    it('should invalidate uppercase IMG tag', () => {
      expect(isInvalid('<IMG src="x">')).toBeTruthy();
    });

    it('should invalidate uppercase SCRIPT tag', () => {
      expect(isInvalid('<SCRIPT>alert(1)</SCRIPT>')).toBeTruthy();
    });

    it('should invalidate markdown link exactly at boundary (500 chars inside brackets)', () => {
      const inner = 'a'.repeat(500);
      const link = `[${inner}](target)`;
      expect(isInvalid(link)).toBeTruthy();
    });

    it('should allow markdown link exceeding boundary (501 chars inside brackets)', () => {
      const inner = 'a'.repeat(501);
      const link = `[${inner}](target)`;
      expect(isInvalid(link)).toBeFalsy();
    });

    it('should invalidate image markdown exactly at boundary (500 chars alt)', () => {
      const inner = 'i'.repeat(500);
      const img = `![${inner}](src)`;
      expect(isInvalid(img)).toBeTruthy();
    });

    it('should allow image markdown exceeding boundary (501 chars alt)', () => {
      const inner = 'i'.repeat(501);
      const img = `![${inner}](src)`;
      expect(isInvalid(img)).toBeFalsy();
    });

    it('should invalidate img tag with long attributes within 500 chars', () => {
      const attrs = 'x'.repeat(400);
      expect(isInvalid(`<img ${attrs}>`)).toBeTruthy();
    });

    it('should allow img tag with attributes exceeding 500 chars', () => {
      const attrs = 'y'.repeat(501);
      expect(isInvalid(`<img ${attrs}>`)).toBeFalsy();
    });

    it('should invalidate multiple dangerous event handlers', () => {
      expect(isInvalid('<div onclick="x()" onmouseover="y()">test</div>')).toBeTruthy();
    });

    it('should invalidate standalone onload attribute', () => {
      expect(isInvalid('onload="do()"')).toBeTruthy();
    });

    it('should allow similar words like onclicked without space or equals', () => {
      expect(isInvalid('This is onclicked and onmouseovered text')).toBeFalsy();
    });

    it('should invalidate mixed content containing both markdown and script', () => {
      expect(isInvalid('[link](url)<script>bad()</script>')).toBeTruthy();
    });

    it('should invalidate incomplete opening script tag with attributes', () => {
      expect(isInvalid('<script type="text/javascript"')).toBeTruthy();
    });

    it('should invalidate script tag with newline before closing bracket', () => {
      expect(isInvalid('<script\n>alert()</script>')).toBeTruthy();
    });

    it('should allow benign angle brackets not forming tags', () => {
      expect(isInvalid('< notatag > just text')).toBeFalsy();
    });
  });
});
