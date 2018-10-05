import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Pipe({
  name: 'ccdIsCompound'
})
export class IsCompoundPipe implements PipeTransform {

  private static readonly COMPOUND_TYPES: FieldTypeEnum[] = [
    'Complex', 'Label', 'AddressGlobal', 'AddressUK', 'AddressGlobalUK'
  ];

  transform(field: CaseField): boolean {
    if (!field || !field.field_type || !field.field_type.type) {
      return false;
    }

    return IsCompoundPipe.COMPOUND_TYPES.indexOf(field.field_type.type) !== -1;
  }

}
