import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Injector, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { RpxTranslationService } from 'rpx-xui-translation';
import { switchMap } from 'rxjs/operators';

@Pipe({
  name: 'ccdFirstError',
  pure: false,
  standalone: false
})
export class FirstErrorPipe implements PipeTransform, OnDestroy {
  private asyncPipe: AsyncPipe;

  constructor(
    private readonly rpxTranslationService: RpxTranslationService,
    private readonly injector: Injector
  ) {
    this.asyncPipe = new AsyncPipe(this.injector.get(ChangeDetectorRef));
  }

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

    let errorMessage: string;
    if (keys[0] === 'required') {
      errorMessage = '%FIELDLABEL% is required';
    } else if (keys[0] === 'pattern') {
      errorMessage = 'The data entered is not valid for %FIELDLABEL%';
    } else if (keys[0] === 'markDownPattern') {
      errorMessage = 'The data entered is not valid for %FIELDLABEL%. Link mark up characters are not allowed in this field';
    } else if (keys[0] === 'minlength') {
      errorMessage = '%FIELDLABEL% is below the minimum length';
    } else if (keys[0] === 'maxlength') {
      errorMessage = '%FIELDLABEL% exceeds the maximum length';
    } else if (value.hasOwnProperty('matDatetimePickerParse')) {
      errorMessage = 'The date entered is not valid. Please provide a valid date';
    } else {
      errorMessage = value[keys[0]];
    }

    const o = this.rpxTranslationService.getTranslation$(args).pipe(
      switchMap(fieldLabel => this.rpxTranslationService.getTranslationWithReplacements$(errorMessage, { FIELDLABEL: fieldLabel }))
    );

    return this.asyncPipe.transform(o);
  }

  public ngOnDestroy(): void {
    this.asyncPipe.ngOnDestroy();
  }
}
