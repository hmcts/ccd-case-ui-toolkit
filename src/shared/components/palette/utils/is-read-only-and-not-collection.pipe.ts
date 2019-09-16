import { Pipe, PipeTransform } from '@angular/core';
import { CaseFieldService } from '../../../services/case-fields';
import { CaseField } from '../../../domain/definition';

@Pipe({
  name: 'ccdIsReadOnlyAndNotCollection'
})
export class IsReadOnlyAndNotCollectionPipe implements PipeTransform {

  constructor(private  caseFieldService: CaseFieldService) {};

  transform(field: CaseField): boolean {
    if (!field || !field.field_type || !field.field_type.type) {
      return false;
    }
    if (this.isCollection(field)) {
      return false;
    }
    return this.caseFieldService.isReadOnly(field);
  }

  private isCollection(field: CaseField): boolean {
    return field.field_type && field.field_type.type === 'Collection';
  }
}
