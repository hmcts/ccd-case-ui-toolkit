import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable, Subscribable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlagDetail } from '../domain';

@Pipe({
  name: 'updateFlagTitleDisplay',
  pure: false
})
export class UpdateFlagTitleDisplayPipe extends AsyncPipe implements PipeTransform {
  private languageObservables = new Map<string, Observable<string>>();

  constructor(
    private readonly translationService: RpxTranslationService,
    private readonly ref: ChangeDetectorRef
  ) {
    super(ref);
  }

  public transform<T>(obj: null|undefined): null;
  public transform<T>(obj: Observable<T>|Subscribable<T>|Promise<T>|null|undefined): T|null;
  public transform<T = FlagDetail>(value: T): string|null;
  public transform<T = FlagDetail>(value: T): string|null {
    if (typeof value === 'object') {
      // Use a map from FlagType code + name + name_cy to an Observable returned by RpxTranslationService, to keep
      // track of which Observables exist already. This is to avoid problems with the async pipe, caused by a new
      // Observable being created by the pipe() operator every time it is called for the same fieldName
      const languageObservableKey = `${value['flagCode']}_${value['name']}_${value['name_cy']}`;
      if (!this.languageObservables.has(languageObservableKey)) {
        const o: Observable<string> = this.translationService.language$.pipe(
          map((_) => {
            const flagName = this.getFlagName(value as unknown as FlagDetail);
            const flagDescription = this.getFlagDescription(value as unknown as FlagDetail);
            const flagComment = this.getFlagComments(value as unknown as FlagDetail);
            return flagName === flagDescription
              ? `${flagDescription}${flagComment}`
              : `${flagName}, ${flagDescription}${flagComment}`;
          })
        );
        this.languageObservables.set(languageObservableKey, o);
        return super.transform<string>(o);
      }
      return super.transform<string>(this.languageObservables.get(languageObservableKey));
    }
    return null;
  }

  public getFlagName(flagDetail: FlagDetail): string {
    return flagDetail.subTypeValue || flagDetail.subTypeValue_cy
      ? this.translationService.language === 'cy'
        ? `${flagDetail.name_cy || flagDetail.name}, ${flagDetail.subTypeValue_cy || flagDetail.subTypeValue}`
        : `${flagDetail.name || flagDetail.name_cy}, ${flagDetail.subTypeValue || flagDetail.subTypeValue_cy}`
      : this.translationService.language === 'cy'
        ? flagDetail.name_cy || flagDetail.name
        : flagDetail.name || flagDetail.name_cy;
  }

  public getFlagDescription(flagDetail: FlagDetail): string {
    /* istanbul ignore else */
    if (flagDetail && flagDetail.name) {
      /* istanbul ignore else */
      if (flagDetail.name === 'Other' && flagDetail.otherDescription ||
        flagDetail.name_cy === 'Arall' && flagDetail.otherDescription_cy) {
        return this.translationService.language === 'cy'
          ? flagDetail.otherDescription_cy || flagDetail.otherDescription
          : flagDetail.otherDescription || flagDetail.otherDescription_cy;
      }
      return this.getFlagName(flagDetail);
    }
    return '';
  }

  public getFlagComments(flagDetail: FlagDetail): string {
    if (flagDetail.flagComment || flagDetail.flagComment_cy) {
      return this.translationService.language === 'cy'
        ? ` - ${flagDetail.flagComment_cy || flagDetail.flagComment}`
        : ` - ${flagDetail.flagComment || flagDetail.flagComment_cy}`;
    }
    return '';
  }
}
