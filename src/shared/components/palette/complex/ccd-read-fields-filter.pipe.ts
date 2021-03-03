import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ShowCondition } from '../../../directives';
import { CaseField } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';

@Pipe({
  name: 'ccdReadFieldsFilter'
})
export class ReadFieldsFilterPipe implements PipeTransform {

  private static readonly EMPTY_VALUES = [
    undefined,
    null,
    '',
    {}
  ];

  private static readonly NESTED_TYPES = {
    'Complex': ReadFieldsFilterPipe.isValidComplex
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
    let value = ReadFieldsFilterPipe.getValue(field, values);

    let hasChildrenWithValue = type.complex_fields.find(f => {
      return ReadFieldsFilterPipe.keepField(f, value);
    });

    return !!hasChildrenWithValue;
  }

  private static isEmpty(value: any): boolean {
    return ReadFieldsFilterPipe.EMPTY_VALUES.indexOf(value) !== -1
      || value.length === 0;
  }

  private static isCompound(field: CaseField): boolean {
    return ReadFieldsFilterPipe.NESTED_TYPES[field.field_type.type];
  }

  private static isValidCompound(field: CaseField, value?: object): boolean {
    return ReadFieldsFilterPipe.isCompound(field)
            && ReadFieldsFilterPipe.NESTED_TYPES[field.field_type.type](field, value);
  }

  private static keepField(field: CaseField, value?: object): boolean {
    // We shouldn't ditch labels.
    if (field.field_type.type === 'Label' && (field.label || '').length > 0) {
      return true;
    }

    value = value || {};

    if (ReadFieldsFilterPipe.isCompound(field)) {
      return ReadFieldsFilterPipe.isValidCompound(field, value);
    }

    return !ReadFieldsFilterPipe.isEmpty(field.value)
              || !ReadFieldsFilterPipe.isEmpty(value[field.id]);
  }

  private static getValue(field: CaseField, values: any, index?: number): any {
    let value: any;
    if (index >= 0 ) {
      value = values[index].value[field.id]
    } else {
      value = values[field.id]
    }
    return ReadFieldsFilterPipe.isEmpty(field.value) ? value : field.value;
  }

  private static evaluateConditionalShow(field: CaseField, formValue: any, path?: string): CaseField {
    if (field.display_context === 'HIDDEN') {
      field.hidden = true;
    } else if (field.show_condition) {
      const cond = ShowCondition.getInstance(field.show_condition);
      field.hidden = !cond.match(formValue, path);
    } else {
      field.hidden = false;
    }
    return field;
  }

  /**
   * Filter out fields having no data to display and harmonise field values coming parent's value.
   *
   * @param complexField A complex field, containing other fields we want to extract
   * @param keepEmpty Whether or not we should filter out empty fields.
   * @param index The index within an array.
   * @param setupHidden Whether or not we should evaluate the show/hide conditions on the fields.
   * @param formGroup The top-level FormGroup that contains the data for show/hide evaluation.
   * @param path The current path to this field.
   * @returns CaseField[]
   */
  transform(
    complexField: CaseField, keepEmpty?: boolean, index?: number,
    setupHidden = false, formGroup?: FormGroup, path?: string): CaseField[] {
    if (!complexField || !complexField.field_type) {
      return [];
    }

    const fields = complexField.field_type.complex_fields || [];
    const values = complexField.value || {};
    let checkConditionalShowAgainst: any = values;
    if (formGroup) {
      checkConditionalShowAgainst = formGroup.value;
    }

    return fields
      .map(f => {
        const clone = FieldsUtils.cloneObject(f);
        const value = ReadFieldsFilterPipe.getValue(f, values, index);
        if (!ReadFieldsFilterPipe.isEmpty(value)) {
          clone.value = value;
        }
        return clone;
      })
      .map(f => {
        if (!f.display_context) {
          f.display_context = complexField.display_context;
        }
        if (setupHidden) {
          ReadFieldsFilterPipe.evaluateConditionalShow(f, checkConditionalShowAgainst, path);
        }
        return f;
      })
      .filter(f => keepEmpty || ReadFieldsFilterPipe.keepField(f));
  }
}
