import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'ccdFirstError'
})
export class FirstErrorPipe implements PipeTransform {

  transform(value: ValidationErrors, args?: string): string {
    if (!value) {
      return '';
    }

    let keys = Object.keys(value);

    if (!keys.length) {
      return '';
    }
    if (keys[0] ===  'required') {
      return `${args} is required`;
    } else if (keys[0] ===  'pattern') {
      return `The data entered is not valid for ${args}`;
    } else if (keys[0] ===  'minlength') {
      return `${args} required minimum length`;
    } else if (keys[0] ===  'maxlength') {
      return `${args} exceeds maximum length`;
    }
    return value[keys[0]];
  }

}
