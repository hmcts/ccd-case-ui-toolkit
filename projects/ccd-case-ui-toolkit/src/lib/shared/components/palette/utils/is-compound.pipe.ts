import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../../domain/definition/field-type-enum.model';

@Pipe({
  name: 'ccdIsCompound',
  standalone: false
})
export class IsCompoundPipe implements PipeTransform {

  private static readonly COMPOUND_TYPES = new Set<FieldTypeEnum>([
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
  ]);

  private static readonly EXCLUDE = new Set([
    'CaseLink',
    'JudicialUser',
    'StaffUser'
  ]);

  public transform(field: CaseField): boolean {
    if (!field || !field.field_type || !field.field_type.type) {
      return false;
    }

    if (IsCompoundPipe.COMPOUND_TYPES.has(field.field_type.type)) {
      if (IsCompoundPipe.EXCLUDE.has(field.field_type.id)) {
        return false;
      }
      return true;
    }

    return false;
  }
}
