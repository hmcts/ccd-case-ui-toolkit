import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { CaseFieldService } from '../../../services/case-fields';

@Pipe({
  name: 'ccdIsReadOnlyAndNotCollection'
})
export class IsReadOnlyAndNotCollectionPipe implements PipeTransform {

  constructor(private readonly  caseFieldService: CaseFieldService) {}

  public transform(field: CaseField): boolean {
    if (!field || !field.field_type || !field.field_type.type) {
      return false;
    }
    if (this.isCollection(field)) {
      return false;
    }
    return this.caseFieldService.isReadOnly(field);
  }

  // CaseField @Expose() doesn't work with the pipe in here, so leaving the manual check
  private isCollection(field: CaseField): boolean {
    return field.field_type && field.field_type.type === 'Collection';
  }
}
