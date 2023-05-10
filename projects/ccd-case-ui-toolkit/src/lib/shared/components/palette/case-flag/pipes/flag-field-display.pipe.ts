import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable, Subscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlagType } from '../../../../domain/case-flag';
import { FlagDetail } from '../domain';

@Pipe({
  name: 'flagFieldDisplay',
  pure: false
})
export class FlagFieldDisplayPipe extends AsyncPipe implements PipeTransform {
  private languageObservables = new Map<string, Observable<string>>();

  constructor(
    private readonly translationService: RpxTranslationService,
    private readonly ref: ChangeDetectorRef
  ) {
    super(ref);
  }

  transform<T>(obj: Observable<T>|Subscribable<T>|Promise<T>): T|null;
  transform<T>(obj: null|undefined): null;
  transform<T>(obj: Observable<T>|Subscribable<T>|Promise<T>|null|undefined): T|null;
  transform<T = FlagType | FlagDetail>(value: T, fieldName: string): string|null;
  transform<T = FlagType | FlagDetail>(value: T, fieldName: string = ''): string|null {
    if (typeof value === 'object' && value.hasOwnProperty(fieldName)) {
      // Use a map from FlagType code + fieldName + fieldName_cy to an Observable returned by RpxTranslationService,
      // to keep track of which Observables exist already. This is to avoid problems with the async pipe, caused by a
      // new Observable being created by the pipe() operator every time it is called for the same fieldName
      const languageObservableKey = `${value['flagCode']}_${value[fieldName]}_${value[`${fieldName}_cy`]}`;
      if (!this.languageObservables.has(languageObservableKey)) {
        const o: Observable<string> = this.translationService.language$.pipe(
          map((lang) => lang === 'cy'
            ? value[`${fieldName}_cy`] || value[fieldName]
            : value[fieldName] || value[`${fieldName}_cy`]
          )
        );
        this.languageObservables.set(languageObservableKey, o);
        return super.transform<string>(o);
      }
      return super.transform<string>(this.languageObservables.get(languageObservableKey));
    }
    return null;
  }
}
