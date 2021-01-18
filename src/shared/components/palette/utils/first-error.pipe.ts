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

    if (!args) {
      args = 'field';
    }

    let keys = Object.keys(value);

    if (!keys.length) {
      return '';
    }

    const keyValue = keys[0];
    switch (keyValue) {
      case 'required':
        return `${args} is required`;
      case 'pattern':
        return `The data entered is not valid for ${args}`;
      case 'minlength':
        return `${args} required minimum length`;
      case 'maxlength':
        return `${args} exceeds maximum length`;
      default:
        return value[keyValue];
    }
  }

}
