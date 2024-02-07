import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable, Subscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Language } from '../domain';

@Pipe({
  name: 'languageInterpreterDisplay',
  pure: false
})
export class LanguageInterpreterDisplayPipe extends AsyncPipe implements PipeTransform {
  private languageObservables = new Map<string, Observable<string>>();

  constructor(
    private readonly translationService: RpxTranslationService,
    private readonly ref: ChangeDetectorRef
  ) {
    super(ref);
  }

  public transform<T>(obj: null|undefined): null;
  public transform<T>(obj: Observable<T>|Subscribable<T>|Promise<T>|null|undefined): T|null;
  public transform<T = Language>(value: T): string|null;
  public transform<T = Language>(value: T): string|null {
    if (typeof value === 'object') {
      // Use a map from Language key to an Observable returned by RpxTranslationService, to keep track of which
      // Observables exist already. This is to avoid problems with the async pipe, caused by a new Observable being
      // created by the pipe() operator every time it is called for the same fieldName
      const languageObservableKey = `${value['key']}`;
      if (!this.languageObservables.has(languageObservableKey)) {
        const o: Observable<string> = this.translationService.language$.pipe(
          map((lang) => lang === 'cy'
            ? value['value_cy'] || value['value']
            : value['value'] || value['value_cy']
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
