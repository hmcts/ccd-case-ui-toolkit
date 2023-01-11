import { Pipe, PipeTransform } from '@angular/core';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';

import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';

@Pipe({
  name: 'ccdFieldsFilter'
})
export class FieldsFilterPipe implements PipeTransform {

  private static readonly EMPTY_VALUES = [
    undefined,
    null,
    '',
    {}
  ];

  private static readonly NESTED_TYPES = {
    Complex: FieldsFilterPipe.isValidComplex
  };

  /**
   * Complex type should have at least on simple field descendant with a value.
   */
  private static isValidComplex(field: CaseField, values?: object): boolean {
    values = values || {};
    const type = field.field_type;
    const value = FieldsFilterPipe.getValue(field, values);

    const hasChildrenWithValue = type.complex_fields.find(f => {
      return FieldsFilterPipe.keepField(f, value);
    });

    return !!hasChildrenWithValue;
  }

  private static isEmpty(value: any): boolean {
    return FieldsFilterPipe.EMPTY_VALUES.indexOf(value) !== -1
      || value.length === 0;
  }

  private static isCompound(field: CaseField): boolean {
    return FieldsFilterPipe.NESTED_TYPES[field.field_type.type];
  }

  private static isValidCompound(field: CaseField, value?: object): boolean {
    return FieldsFilterPipe.isCompound(field)
            && FieldsFilterPipe.NESTED_TYPES[field.field_type.type](field, value);
  }

  private static keepField(field: CaseField, value?: object): boolean {
    // We shouldn't ditch labels.
    if (field.field_type.type === 'Label' && (field.label || '').length > 0) {
      return true;
    }

    value = value || {};

    if (FieldsFilterPipe.isCompound(field)) {
      return FieldsFilterPipe.isValidCompound(field, value);
    }

    return !FieldsFilterPipe.isEmpty(field.value)
              || !FieldsFilterPipe.isEmpty(value[field.id]);
  }

  private static getValue(field: CaseField, values: any, index?: number): any {
    let value: any;
    if (index >= 0 ) {
      value = values[index].value[field.id];
    } else {
      value = values[field.id];
    }
    return FieldsFilterPipe.isEmpty(field.value) ? value : field.value;
  }

  /**
   * Filter out fields having no data to display and harmonise field values coming parent's value.
   */
  public transform(complexField: CaseField, keepEmpty?: boolean, index?: number, stripHidden= false): CaseField[] {
    if (!complexField || !complexField.field_type) {
      return [];
    }

    const fields = complexField.field_type.complex_fields || [];
    const values = complexField.value || {};
    const checkConditionsAgainst = { [complexField.id]: values };

    return fields
      .filter( f => {
        if (stripHidden && f.show_condition) {
          const cond = ShowCondition.getInstance(f.show_condition);
          return cond.match(checkConditionsAgainst);
        }
        return true;
      })
      .map(f => {
        const clone = FieldsUtils.cloneObject(f);
        const value = FieldsFilterPipe.getValue(f, values, index);
        if (!FieldsFilterPipe.isEmpty(value)) {
          clone.value = value;
        }
        return clone;
      })
      .filter(f => keepEmpty || FieldsFilterPipe.keepField(f))
      .map(f => {
        if (!f.display_context) {
          f.display_context = complexField.display_context;
        }
        return f;
      });
  }
}
