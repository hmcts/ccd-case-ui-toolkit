import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { plainToClassFromExist } from 'class-transformer';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';

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

  private static readonly ALWAYS_NULL_FIELDS = ['CasePaymentHistoryViewer', 'WaysToPay', 'ComponentLauncher'];

  private static readonly NESTED_TYPES = {
    Complex: ReadFieldsFilterPipe.isValidComplex,
    Collection: ReadFieldsFilterPipe.isValidCollection
  };

  /**
   * Complex type should have at least on simple field descendant with a value.
   */
  private static isValidComplex(field: CaseField, values?: object): boolean {
    values = values || {};
    const type = field.field_type;
    const value = ReadFieldsFilterPipe.getValue(field, values);

    const hasChildrenWithValue = type.complex_fields.find(f => {
      const willKeep = ReadFieldsFilterPipe.keepField(f, value, true);
      return willKeep && ReadFieldsFilterPipe.evaluateConditionalShow(f, value).hidden !== true;
    });

    return !!hasChildrenWithValue;
  }

  private static isValidCollection(field: CaseField, values?: object): boolean {
    // if field is collection and it has complex/collection child field; parent field doesnt have value defined
    if (!Array.isArray(field.value) && values && values.hasOwnProperty(field.id)) {
      return true;
    }
    const isNotEmpty = Array.isArray(field.value) && field.value.length > 0;
    if (isNotEmpty && field.field_type.collection_field_type.type === 'Complex') {
      return !!field.value.find(item => {
        const complexField = plainToClassFromExist(new CaseField(), {
          id: field.field_type.collection_field_type.id,
          field_type: field.field_type.collection_field_type,
          value: item.value,
          label: null,
        });
        return ReadFieldsFilterPipe.isValidComplex(complexField);
      });
    }
    return isNotEmpty;
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

  private static keepField(field: CaseField, value?: object, ignoreLabels = false): boolean {
    // We shouldn't ditch labels.
    if (!ignoreLabels && field.field_type.type === 'Label' && (field.label || '').length > 0) {
      return true;
    }
    // We also shouldn't ditch fields that will always come back with a null value.
    if (this.ALWAYS_NULL_FIELDS.indexOf(field.field_type.type) !== -1) {
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
      value = values[index].value[field.id];
    } else {
      value = values[field.id];
    }
    return ReadFieldsFilterPipe.isEmpty(field.value) ? value : field.value;
  }

  private static evaluateConditionalShow(field: CaseField, formValue: any, path?: string,
    formGroupAvaliable?: boolean, fieldId?: string): CaseField {
    if (field.display_context === 'HIDDEN') {
      field.hidden = true;
    } else if (field.show_condition) {
      let cond: ShowCondition;
      if (fieldId && field.show_condition.indexOf(fieldId) > -1 && !formGroupAvaliable && !!Object.keys(formValue).length) {
        const search = fieldId + '.';
        const searchRegExp = new RegExp(search, 'g');
        const replaceWith = '';
        cond = ShowCondition.getInstance(field.show_condition.replace(searchRegExp, replaceWith));
      } else {
        cond = ShowCondition.getInstance(field.show_condition);
      }
      field.hidden = !cond.match(formValue, path);
    } else {
      field.hidden = false;
    }
    return field;
  }

  /**
   * Filter out fields having no data to display and harmonise field values coming parent's value.
   */
  public transform(
    complexField: CaseField, keepEmpty?: boolean, index?: number,
    setupHidden = false, formGroup?: FormGroup | AbstractControl, path?: string): CaseField[] {
    if (!complexField || !complexField.field_type) {
      return [];
    }

    const fields = complexField.field_type.complex_fields || [];
    const values = complexField.value || {};
    let checkConditionalShowAgainst: any = values;
    let formGroupAvailable = false;
    if (formGroup) {
      checkConditionalShowAgainst = formGroup.value;
      formGroupAvailable = true;
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
          ReadFieldsFilterPipe.evaluateConditionalShow(f, checkConditionalShowAgainst, path, formGroupAvailable, complexField.id);
        }
        return f;
      })
      .filter(f => keepEmpty || ReadFieldsFilterPipe.keepField(f));
  }
}
