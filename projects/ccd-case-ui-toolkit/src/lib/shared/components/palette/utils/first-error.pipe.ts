import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { RpxTranslatePipe } from 'rpx-xui-translation';

@Pipe({
  name: 'ccdFirstError',
  pure: false
})
export class FirstErrorPipe implements PipeTransform {
  constructor(
    private readonly rpxTranslationPipe: RpxTranslatePipe,
  ) {}

  public transform(value: ValidationErrors, args?: string): string {
    if (!value) {
      return '';
    }

    if (!args) {
      args = 'Field';
    }

    const keys = Object.keys(value);

    if (!keys.length) {
      return '';
    }

    const fieldLabel = this.rpxTranslationPipe.transform(args);

    let errorMessage: string;
    if (keys[0] === 'required') {
      errorMessage = '%FIELDLABEL% is required';
    } else if (keys[0] === 'pattern') {
      errorMessage = 'The data entered is not valid for %FIELDLABEL%';
    } else if (keys[0] === 'minlength') {
      errorMessage = '%FIELDLABEL% is below the minimum length';
    } else if (keys[0] === 'maxlength') {
      errorMessage = '%FIELDLABEL% exceeds the maximum length';
    } else if (value.hasOwnProperty('matDatetimePickerParse')) {
      errorMessage = 'The date entered is not valid. Please provide a valid date';
    } else {
      errorMessage = value[keys[0]];
    }

    return this.rpxTranslationPipe.transform(errorMessage, { FIELDLABEL: fieldLabel });
  }
}
