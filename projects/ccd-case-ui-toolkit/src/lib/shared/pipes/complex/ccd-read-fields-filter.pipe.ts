import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';

import { plainToClassFromExist } from 'class-transformer';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../../services/fields/fields.utils';

@Pipe({
  name: 'ccdReadFieldsFilter',
  standalone: false
})
export class ReadFieldsFilterPipe implements PipeTransform {

  private static readonly EMPTY_VALUES = [
    undefined,
    null,
    '',
    {}
  ];

  private static readonly ALWAYS_NULL_FIELDS = ['CasePaymentHistoryViewer', 'WaysToPay', 'FlagLauncher', 'ComponentLauncher'];

  private static readonly NESTED_TYPES = {
    Complex: ReadFieldsFilterPipe?.isValidComplex,
    Collection: ReadFieldsFilterPipe?.isValidCollection
  };

  /**
   * Complex type should have at least on simple field descendant with a value.
   */
  private static isValidComplex(field: CaseField, values?: object, checkConditionalShowAgainst?: object): boolean {
    values = values || {};
    const type = field.field_type;
    const value = ReadFieldsFilterPipe.getValue(field, values);

    const hasChildrenWithValue = type.complex_fields.find(f => {
      const willKeep = ReadFieldsFilterPipe.keepField(f, value, true, checkConditionalShowAgainst);
      return willKeep && ReadFieldsFilterPipe.evaluateConditionalShow(f, checkConditionalShowAgainst).hidden !== true;
    });

    return !!hasChildrenWithValue;
  }

  private static isValidCollection(field: CaseField, values?: object, checkConditionalShowAgainst?: object): boolean {
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
        return ReadFieldsFilterPipe.isValidComplex(complexField, undefined, checkConditionalShowAgainst);
      });
    }
    return isNotEmpty;
  }

  private static isEmpty(value: any): boolean {
    const fieldValue = value?.hasOwnProperty('list_items')  && value?.hasOwnProperty('value') ? value.value : value;
    return  ReadFieldsFilterPipe.EMPTY_VALUES.indexOf(fieldValue) !== -1
      || fieldValue.length === 0;
  }

  private static isCompound(field: CaseField): boolean {
    return ReadFieldsFilterPipe.NESTED_TYPES[field.field_type.type];
  }

  private static findAncestorOfType(field: CaseField | undefined, type: string): CaseField | undefined {
    let current = field?.parent;
    while (current) {
      if (current?.field_type?.type === type) {
        return current;
      }
      current = current.parent || undefined;
    }
    return undefined;
  }

  private static getCollectionItemValue(field: CaseField | undefined): object {
    let current = field?.parent;
    while (current) {
      if (current?.field_type?.type === 'Complex' && current?.parent?.field_type?.type === 'Collection') {
        return current.value || {};
      }
      current = current.parent || undefined;
    }
    return {};
  }

  private static getBaseConditionalShowContext(
    formGroup?: FormGroup | AbstractControl,
    values?: object
  ): { checkConditionalShowAgainst: any; formGroupAvailable: boolean } {
    const currentValues = values || {};
    if (!formGroup) {
      return { checkConditionalShowAgainst: currentValues, formGroupAvailable: false };
    }

    return {
      checkConditionalShowAgainst: formGroup.value ? formGroup.parent.getRawValue().data : formGroup,
      formGroupAvailable: true
    };
  }

  private static resolvePrefixedConditionalShowContext(
    checkConditionalShowAgainst: any,
    currentValues: object,
    idPrefix: string
  ): { checkConditionalShowAgainst: any; formGroupAvailable: boolean } {
    const fieldId = idPrefix.substring(0, idPrefix.indexOf('_'));
    if (checkConditionalShowAgainst[fieldId]) {
      return {
        checkConditionalShowAgainst: currentValues,
        formGroupAvailable: false
      };
    }

    return {
      checkConditionalShowAgainst,
      formGroupAvailable: true
    };
  }

  private static resolveCollectionConditionalShowContext(
    complexField: CaseField,
    checkConditionalShowAgainst: any,
    currentValues: object
  ): { checkConditionalShowAgainst: any; formGroupAvailable: boolean } {
    const collectionItemValue = ReadFieldsFilterPipe.getCollectionItemValue(complexField);
    if (Object.keys(collectionItemValue).length > 0) {
      return {
        checkConditionalShowAgainst: Object.assign(collectionItemValue, currentValues),
        formGroupAvailable: false
      };
    }

    return {
      checkConditionalShowAgainst: Object.assign(checkConditionalShowAgainst, currentValues),
      formGroupAvailable: false
    };
  }

  private static resolveFallbackConditionalShowContext(
    checkConditionalShowAgainst: any,
    currentValues: object
  ): { checkConditionalShowAgainst: any; formGroupAvailable: boolean } {
    return {
      checkConditionalShowAgainst: Object.assign(checkConditionalShowAgainst, currentValues),
      formGroupAvailable: false
    };
  }

  private static getConditionalShowContext(
    complexField: CaseField,
    formGroup?: FormGroup | AbstractControl,
    path?: string,
    idPrefix?: string,
    values?: object
  ): { checkConditionalShowAgainst: any; formGroupAvailable: boolean } {
    const currentValues = values || {};
    const baseContext = ReadFieldsFilterPipe.getBaseConditionalShowContext(formGroup, currentValues);
    let checkConditionalShowAgainst = baseContext.checkConditionalShowAgainst;
    let formGroupAvailable = baseContext.formGroupAvailable;

    if (!formGroup || idPrefix === undefined) {
      return { checkConditionalShowAgainst, formGroupAvailable };
    }

    if (idPrefix !== '') {
      return ReadFieldsFilterPipe.resolvePrefixedConditionalShowContext(checkConditionalShowAgainst, currentValues, idPrefix);
    }

    if (path === 'parent_value' && ReadFieldsFilterPipe.findAncestorOfType(complexField, 'Collection')) {
      return ReadFieldsFilterPipe.resolveCollectionConditionalShowContext(
        complexField,
        checkConditionalShowAgainst,
        currentValues
      );
    }

    return ReadFieldsFilterPipe.resolveFallbackConditionalShowContext(checkConditionalShowAgainst, currentValues);
  }

  private static cloneFieldWithValue(field: CaseField, values: any, index?: number): CaseField {
    const clone = FieldsUtils.cloneObject(field);
    const value = ReadFieldsFilterPipe.getValue(field, values, index);
    if (!ReadFieldsFilterPipe.isEmpty(value)) {
      clone.value = value;
    }
    return clone;
  }

  private static applyDisplayContextAndHidden(
    field: CaseField,
    complexField: CaseField,
    setupHidden: boolean,
    checkConditionalShowAgainst: any,
    formGroupAvailable: boolean,
    path?: string
  ): CaseField {
    if (!field.display_context && FieldsUtils.isValidDisplayContext(complexField.display_context)) {
      field.display_context = complexField.display_context;
    }
    if (setupHidden) {
      ReadFieldsFilterPipe.evaluateConditionalShow(field, checkConditionalShowAgainst, path, formGroupAvailable, complexField.id);
    }
    return field;
  }

  private static isValidCompound(field: CaseField, value?: object, checkConditionalShowAgainst?: object): boolean {
    return ReadFieldsFilterPipe.isCompound(field)
            && ReadFieldsFilterPipe.NESTED_TYPES[field.field_type.type](field, value, checkConditionalShowAgainst);
  }

  private static keepField(field: CaseField, value?: object, ignoreLabels = false, checkConditionalShowAgainst?: object): boolean {
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
      return ReadFieldsFilterPipe.isValidCompound(field, value, checkConditionalShowAgainst);
    }

    return !ReadFieldsFilterPipe.isEmpty(field.value)
      || !ReadFieldsFilterPipe.isEmpty(value[field.id]);
  }

  private static getValue(field: CaseField, values: any, index?: number): any {
    if (ReadFieldsFilterPipe.isEmpty(field.value)) {
      let value: any;
      if (index >= 0) {
        value = values[index].value[field.id];
      } else {
        value = values[field.id];
      }

      return value;
    }
    return field.value;
  }

  private static evaluateConditionalShow(field: CaseField, formValue: any, path?: string,
    formGroupAvailable?: boolean, fieldId?: string): CaseField {
    if (field.display_context === 'HIDDEN') {
      field.hidden = true;
    } else if (field.show_condition) {
      let cond: ShowCondition;
      if (fieldId && field.show_condition.indexOf(`${fieldId}.`) > -1 && !formGroupAvailable && !!Object.keys(formValue).length) {
        const search = `/.*${fieldId}./`;
        const searchRegExp = new RegExp(search, 'g');
        const replaceWith = '';
        cond = ShowCondition.getInstance(field.show_condition.replace(searchRegExp, replaceWith));
      } else {
        cond = ShowCondition.getInstance(field.show_condition);
      }
      if (path) {
        // EXUI-2460 - evaluate with and without path to ensure validity
        field.hidden = !cond.match(formValue, path) ? !cond.match(formValue) : false;
      } else {
        // if no path there is no need to evaluate twice
        field.hidden = !cond.match(formValue);
      }
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
    setupHidden = false, formGroup?: FormGroup | AbstractControl, path?: string, idPrefix?: string): CaseField[] {
    if (!complexField || !complexField.field_type) {
      return [];
    }

    const fields = complexField.field_type.complex_fields || [];
    const values = complexField.value || {};
    const conditionalShowContext = ReadFieldsFilterPipe.getConditionalShowContext(
      complexField,
      formGroup,
      path,
      idPrefix,
      values
    );

    return fields
      .map(f => ReadFieldsFilterPipe.cloneFieldWithValue(f, values, index))
      .map(f => ReadFieldsFilterPipe.applyDisplayContextAndHidden(
        f,
        complexField,
        setupHidden,
        conditionalShowContext.checkConditionalShowAgainst,
        conditionalShowContext.formGroupAvailable,
        path
      ))
      .filter(f => keepEmpty || ReadFieldsFilterPipe.keepField(
        f,
        undefined,
        false,
        conditionalShowContext.checkConditionalShowAgainst
      ));
  }
}
