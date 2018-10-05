import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';

@Pipe({
  name: 'ccdFieldLabel'
})
export class FieldLabelPipe implements PipeTransform {

  transform (field: CaseField): string {
    if (!field || !field.label) {
      return '';
    } else if (!field.display_context) {
      return field.label;
    }
    return field.label + (field.display_context.toUpperCase() === 'OPTIONAL' ? ' (Optional)' : '');
  }
}
