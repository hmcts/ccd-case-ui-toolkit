import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../../domain/definition/field-type-enum.model';

@Pipe({
  name: 'ccdIsCompound'
})
export class IsCompoundPipe implements PipeTransform {

  private static readonly CASE_LINK_FIELD_TYPE = 'CaseLink';

  private static readonly COMPOUND_TYPES: FieldTypeEnum[] = [
    'Complex',
    'Label',
    'AddressGlobal',
    'AddressUK',
    'AddressGlobalUK',
    'CasePaymentHistoryViewer',
    'CaseHistoryViewer',
    'Organisation',
    'WaysToPay',
    'ComponentLauncher',
    'FlagLauncher',
    'CaseFlag'
  ];

  private static readonly EXCLUDE: string[] = [
    'CaseLink',
    'JudicialUser'
  ];

  public transform(field: CaseField): boolean {
    if (!field || !field.field_type || !field.field_type.type) {
      return false;
    }

    // Case link tab spacing alignment fix
    // This Pipe needs to be re-visited
    // to make it more generic to support and fix alignments issues for multiple tabs
    if (field.field_type.collection_field_type &&
        field.field_type.collection_field_type.id &&
        field.field_type.collection_field_type.id === IsCompoundPipe.CASE_LINK_FIELD_TYPE) {
      return true;
    }

    if (IsCompoundPipe.COMPOUND_TYPES.indexOf(field.field_type.type) !== -1) {
      if (IsCompoundPipe.EXCLUDE.indexOf(field.field_type.id) !== -1) {
        return false;
      }
      return true;
    }

    return false;
  }

}
