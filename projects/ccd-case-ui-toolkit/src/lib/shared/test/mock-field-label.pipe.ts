/* istanbul ignore file */
import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../domain/definition/case-field.model';

@Pipe({
    name: 'ccdFieldLabel',
    standalone: false
})
export class MockFieldLabelPipe implements PipeTransform {
  public transform (field: CaseField): string {
    return field?.label + (field?.display_context?.toUpperCase() === 'OPTIONAL' ? ' (Optional)' : '');
  }
}
