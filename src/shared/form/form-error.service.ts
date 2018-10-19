import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Injectable()
export class FormErrorService {

  public mapFieldErrors(errors: { id: string; message: string }[], form: FormGroup, errorKey: string): void {

    errors.forEach(error => {
      let formControl = this.getFormControl(form, error.id);

      if (formControl) {
        formControl.setErrors({
          [errorKey]: error.message
        });
      }
    });
  }

  private getFormControl(form: FormGroup, fieldId: string): FormControl {
    let fields = fieldId.split('.');

    let group: FormGroup = form;
    let inArray = false;
    let control: FormControl;
    fields.every((field, index) => {
      if (index === fields.length - 1) {
        control = group.controls[field] as FormControl;
      } else {
        group = group.controls[field] as FormGroup;

        if (inArray && group.controls['value']) {
          group = group.controls['value'] as FormGroup;
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
