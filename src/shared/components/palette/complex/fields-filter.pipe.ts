import { Pipe, PipeTransform } from '@angular/core';
import { CaseField } from '../../../domain/definition/case-field.model';

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
    'Complex': FieldsFilterPipe.isValidComplex
  };

  /**
   * Complex type should have at least on simple field descendant with a value.
   *
   * @param field
   * @param values
   * @returns {boolean}
   */
  private static isValidComplex(field: CaseField, values?: object): boolean {
    values = values || {};
    let type = field.field_type;
    let value = FieldsFilterPipe.getValue(field, values);

    let hasChildrenWithValue = type.complex_fields.find(f => {
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
    value = value || {};

    if (FieldsFilterPipe.isCompound(field)) {
      return FieldsFilterPipe.isValidCompound(field, value);
    }

    return !FieldsFilterPipe.isEmpty(field.value)
              || !FieldsFilterPipe.isEmpty(value[field.id]);
  }

  private static getValue(field: CaseField, values: any): any {
    return FieldsFilterPipe.isEmpty(field.value) ? values[field.id] : field.value;
  }

  /**
   * Filter out fields having no data to display and harmonise field values coming parent's value.
   *
   * @param complexField
   * @param keepEmpty
   * @returns {any}
   */
  transform(complexField: CaseField, keepEmpty?: boolean): CaseField[] {
    if (!complexField || !complexField.field_type) {
      return [];
    }

    let fields = complexField.field_type.complex_fields || [];
    let values = complexField.value || {};

    return fields
      .map(f => {
        let clone = Object.assign(new CaseField(), f);

        let value = FieldsFilterPipe.getValue(f, values);

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
