import { Pipe, PipeTransform } from '@angular/core';
import { RpxTranslatePipe } from 'rpx-xui-translation';
import { CaseField } from '../../../domain/definition/case-field.model';

@Pipe({
  name: 'ccdFieldLabel',
  pure: false,
  standalone: false
})
export class FieldLabelPipe implements PipeTransform {

  constructor(
    private readonly rpxTranslationPipe: RpxTranslatePipe
  ) {
  }

  public transform(field: CaseField): string {
    if (!field || !field.label) {
      return '';
    } else if (!field.display_context) {
      return this.getTranslatedLabel(field);
    }
    return this.getTranslatedLabel(field) + (field.display_context.toUpperCase() === 'OPTIONAL' ?
      ' (' + this.rpxTranslationPipe.transform('Optional') + ')' : '');
  }

  private getTranslatedLabel(field: CaseField): string {
    if (!field.isTranslated) {
      return this.rpxTranslationPipe.transform(field.label);
    } else {
      return field.label;
    }
  }

  public getOriginalLabelForYesNoTranslation(field: CaseField): string {
    return field.originalLabel || field.label;
  }
}
