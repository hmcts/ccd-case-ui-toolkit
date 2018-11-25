import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'ccdFirstError'
})
export class FirstErrorPipe implements PipeTransform {

  transform(value: ValidationErrors): string {
    if (!value) {
      return '';
    }

    let keys = Object.keys(value);

    if (!keys.length) {
      return '';
    }
    if (keys[0] ===  'required') {
      return 'This field is required';
    } else if (keys[0] ===  'pattern') {
      return 'Invalid data';
    }
    return value[keys[0]];
  }

}
