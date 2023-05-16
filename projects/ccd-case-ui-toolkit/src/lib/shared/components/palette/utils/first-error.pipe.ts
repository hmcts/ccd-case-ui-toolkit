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

    if (keys[0] === 'required') {
      return this.rpxTranslationPipe.transform('%FIELDLABEL% is required', { FIELDLABEL: fieldLabel });
    } else if (keys[0] === 'pattern') {
      return this.rpxTranslationPipe.transform('The data entered is not valid for %FIELDLABEL%', { FIELDLABEL: fieldLabel });
    } else if (keys[0] === 'minlength') {
      return this.rpxTranslationPipe.transform('%FIELDLABEL% is below the minimum length', { FIELDLABEL: fieldLabel });
    } else if (keys[0] === 'maxlength') {
      return this.rpxTranslationPipe.transform('%FIELDLABEL% exceeds the maximum length', { FIELDLABEL: fieldLabel });
    } else if (value.hasOwnProperty('matDatetimePickerParse')) {
      return this.rpxTranslationPipe.transform('The date entered is not valid. Please provide a valid date');
    }

    return value[keys[0]];
  }
}
