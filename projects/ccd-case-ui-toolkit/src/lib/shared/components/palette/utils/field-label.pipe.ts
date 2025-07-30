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
  ) {}
  
  public transform (field: CaseField): string {
    if (!field || !field.label) {
      return '';
    } else if (!field.display_context) {
      return this.rpxTranslationPipe.transform(field.label);
    }
    return this.rpxTranslationPipe.transform(field.label) + (field.display_context.toUpperCase() === 'OPTIONAL' ? 
      ' (' + this.rpxTranslationPipe.transform('Optional') + ')' : '');
  }
}
