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
    if (field.field_type.type === 'Collection') {
      return false;
    }
    return this.caseFieldService.isReadOnly(field);
  }
}
