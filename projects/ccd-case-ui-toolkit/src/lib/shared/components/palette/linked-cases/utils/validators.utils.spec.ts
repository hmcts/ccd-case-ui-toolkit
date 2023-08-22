import { inject, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { ValidatorsUtils } from './validators.utils';

describe('ValidatorsUtils', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ValidatorsUtils]
    });
  });

  it('should be created', inject([ValidatorsUtils], (service: ValidatorsUtils) => {
    expect(service).toBeTruthy();
  }));

  it('should validate number length', inject([ValidatorsUtils], (service: ValidatorsUtils) => {
    const control = new FormControl();
    control.setValidators(service.numberLengthValidator(2));
    control.setValue(100);
    expect(control.hasError('isValid')).toBeFalsy();
  }));

  it('should check formArraySelectedValidator', inject([ValidatorsUtils], (service: ValidatorsUtils) => {
    const form = new UntypedFormGroup({
      arrayControl: new FormArray([new UntypedFormGroup({
        selection: new UntypedFormGroup({})
      })]
      ),
    });
    form.setValidators(service.formArraySelectedValidator());
    expect(form.hasError('isValid')).toBeFalsy();
  }));
});
