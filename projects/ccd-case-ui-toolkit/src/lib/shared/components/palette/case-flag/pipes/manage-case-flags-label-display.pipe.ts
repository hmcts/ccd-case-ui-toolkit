import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { RpxTranslationService } from 'rpx-xui-translation';
import { Observable, Subscribable, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath } from '../domain';

@Pipe({
  name: 'manageCaseFlagsLabelDisplay',
  pure: false
})
export class ManageCaseFlagsLabelDisplayPipe extends AsyncPipe implements PipeTransform {
  private static readonly CASE_LEVEL_CASE_FLAGS_FIELD_ID = 'caseFlags';
  private languageObservables = new Map<string, Observable<string>>();

  constructor(
    private readonly translationService: RpxTranslationService,
    private readonly ref: ChangeDetectorRef
  ) {
    super(ref);
  }

  public transform<T>(obj: null|undefined): null;
  public transform<T>(obj: Observable<T>|Subscribable<T>|Promise<T>|null|undefined): T|null;
  public transform<T = FlagDetailDisplayWithFormGroupPath>(value: T): string|null;
  public transform<T = FlagDetailDisplayWithFormGroupPath>(value: T): string|null {
    if (typeof value === 'object') {
      // Use a map from FlagType code + name + name_cy to an Observable returned by RpxTranslationService, to keep
      // track of which Observables exist already. This is to avoid problems with the async pipe, caused by a new
      // Observable being created by the pipe() operator every time it is called for the same fieldName
      const flagDetail = (value as unknown as FlagDetailDisplayWithFormGroupPath).flagDetailDisplay.flagDetail;
      const languageObservableKey = `${flagDetail.flagCode}_${flagDetail.name}_${flagDetail.name_cy}`;
      if (!this.languageObservables.has(languageObservableKey)) {
        const partyName$: Observable<string> = this.getPartyName(value as unknown as FlagDetailDisplayWithFormGroupPath);
        const o$: Observable<string> = this.translationService.language$.pipe(
          map((_) => {
            const flagName = this.getFlagName(flagDetail);
            const flagDescription = this.getFlagDescription(flagDetail);
            const flagComment = this.getFlagComments(flagDetail);
            return flagName === flagDescription
              ? `<span class="flag-name-and-description">${flagDescription}</span>${flagComment}`
              : `<span class="flag-name-and-description">${flagName}, ${flagDescription}</span>${flagComment}`
          })
        );
        const combined = combineLatest([partyName$, o$]).pipe(
          map(([partyName, o]) => {
            const roleOnCase = this.getRoleOnCase(value as unknown as FlagDetailDisplayWithFormGroupPath);
            return `${partyName}${roleOnCase} - ${o}`;
          })
        );
        this.languageObservables.set(languageObservableKey, combined);
        return super.transform<string>(combined);
      }
      return super.transform<string>(this.languageObservables.get(languageObservableKey));
    }
    return null;
  }

  public getPartyName(flagDisplay: FlagDetailDisplayWithFormGroupPath): Observable<string> {
    if (flagDisplay.pathToFlagsFormGroup && flagDisplay.pathToFlagsFormGroup === ManageCaseFlagsLabelDisplayPipe.CASE_LEVEL_CASE_FLAGS_FIELD_ID) {
      return this.translationService.language === 'cy'
        ? this.translationService.getTranslation('Case level')
        : of('Case level');
    }
    if (flagDisplay.flagDetailDisplay.partyName) {
      return of(`${flagDisplay.flagDetailDisplay.partyName}`);
    }
    return of('');
  }

  public getRoleOnCase(flagDisplay: FlagDetailDisplayWithFormGroupPath): string {
    if (flagDisplay && flagDisplay.roleOnCase) {
      return ` (${flagDisplay.roleOnCase})`;
    }
    return '';
  }

  public getFlagName(flagDetail: FlagDetail): string {
    if (flagDetail && flagDetail.path && flagDetail.path.length > 1) {
      // Currently, flag path values are stored in English only
      return flagDetail.path[1].value;
    }
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
      return flagDetail.subTypeValue || flagDetail.subTypeValue_cy
      ? this.translationService.language === 'cy'
        ? `${flagDetail.name_cy || flagDetail.name}, ${flagDetail.subTypeValue_cy || flagDetail.subTypeValue}`
        : `${flagDetail.name || flagDetail.name_cy}, ${flagDetail.subTypeValue || flagDetail.subTypeValue_cy}`
      : this.translationService.language === 'cy'
        ? flagDetail.name_cy || flagDetail.name
        : flagDetail.name || flagDetail.name_cy;
    }
    return '';
  }

  public getFlagComments(flagDetail: FlagDetail): string {
    if (flagDetail.flagComment || flagDetail.flagComment_cy) {
      return this.translationService.language === 'cy'
        ? ` (${flagDetail.flagComment_cy || flagDetail.flagComment})`
        : ` (${flagDetail.flagComment || flagDetail.flagComment_cy})`;
    }
    return '';
  }
}
