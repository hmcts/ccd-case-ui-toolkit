import { Injectable } from '@angular/core';
import { FormArray, FormControl, UntypedFormGroup } from '@angular/forms';

@Injectable()
export class FormErrorService {

  public mapFieldErrors(errors: { id: string; message: string }[], form: UntypedFormGroup, errorKey: string): void {

    errors.forEach(error => {
      const formControl = this.getFormControl(form, error.id);

      if (formControl) {
        formControl.setErrors({
          [errorKey]: error.message
        });
      }
    });
  }

  private getFormControl(form: UntypedFormGroup, fieldId: string): FormControl {
    const fields = fieldId.split('.');

    let group: UntypedFormGroup = form;
    let inArray = false;
    let control: FormControl;
    fields.every((field, index) => {
      if (index === fields.length - 1) {
        control = group.controls[field] as FormControl;
      } else {
        group = group.controls[field] as UntypedFormGroup;

        if (inArray && group.controls['value']) {
          group = group.controls['value'] as UntypedFormGroup;
        }

        if (group && group.constructor && FormArray.name === group.constructor.name) {
          inArray = true;
        } else {
          inArray = false;
        }
      }
      return !!group;
    });

    return control;
  }
}
