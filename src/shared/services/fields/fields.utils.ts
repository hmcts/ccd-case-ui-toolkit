import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';

import { WizardPage } from '../../components/case-editor/domain';
import { AbstractFormFieldComponent } from '../../components/palette/base-field/abstract-form-field.component';
import { DatePipe } from '../../components/palette/utils';
import { CaseEventTrigger, CaseField, CaseTab, CaseView, FixedListItem, Predicate } from '../../domain';
import { FormatTranslatorService } from '../case-fields/format-translator.service';

// @dynamic
@Injectable()
export class FieldsUtils {

  private static readonly currencyPipe: CurrencyPipe = new CurrencyPipe('en-GB');
  private static readonly datePipe: DatePipe = new DatePipe(new FormatTranslatorService());
  public static readonly LABEL_SUFFIX = '-LABEL';

  public static convertToCaseField(obj: any): CaseField {
    if (!(obj instanceof CaseField)) {
      return plainToClassFromExist(new CaseField(), obj);
    }
    return obj;
  }

  public static toValuesMap(caseFields: CaseField[]): any {
    const valueMap = {};
    caseFields.forEach(field => {
      valueMap[field.id] = FieldsUtils.prepareValue(field);
    });
    return valueMap;
  }

  public static getType(elem: any): string {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }

  public static isObject(elem: any): boolean {
    return typeof elem === 'object' && elem !== null;
  }

  public static isNonEmptyObject(elem: any): boolean {
      return this.isObject(elem) && Object.keys(elem).length !== 0;
  }

  public static isArray(elem: any): boolean {
    return Array.isArray(elem);
  }

  public static areCollectionValuesSimpleFields(fieldValue: any[]): boolean {
    return !this.isObject(fieldValue[0]['value']) && !Array.isArray(fieldValue[0]['value']) && fieldValue[0]['value'] !== undefined;
  }

  public static isCollectionOfSimpleTypes(fieldValue: any): boolean {
    return this.isCollection(fieldValue) && this.areCollectionValuesSimpleFields(fieldValue);
  }

  public static isMultiSelectValue(form: any): boolean {
    return this.isNonEmptyArray(form) && !this.isCollectionWithValue(form);
  }

  public static isNonEmptyArray(pageFormFields: any): boolean {
    return Array.isArray(pageFormFields) && pageFormFields[0] !== undefined;
  }

  public static isCollection(pageFormFields: any): boolean {
    return this.isNonEmptyArray(pageFormFields) && this.isCollectionWithValue(pageFormFields);
  }

  public static isCollectionWithValue(pageFormFields: any[]): boolean {
    return pageFormFields[0]['value'] !== undefined;
  }

  public static cloneObject(obj: any): any {
    return Object.assign({}, obj);
  }

  // temporary function until this can be moved to CaseView class (RDM-2681)
  public static getCaseFields(caseView: CaseView): CaseField[] {
    const caseDataFields: CaseField[] = caseView.tabs.reduce((acc: CaseField[], tab: CaseTab) => {
      return acc.concat(tab.fields);
    }, []);

    const metadataFields: CaseField[] = caseView.metadataFields;
    return metadataFields.concat(caseDataFields.filter((caseField: CaseField) => {
      return metadataFields.findIndex(metadataField => metadataField.id === caseField.id) < 0;
    }));
  }

  private static prepareValue(field: CaseField): any {
    if (field.value) {
      return field.value;
    } else if (field.isComplex()) {
      const valueMap = {};
      field.field_type.complex_fields.forEach(complexField => {
        valueMap[complexField.id] = FieldsUtils.prepareValue(complexField);
      });
      return valueMap;
    }
  }

  private static readonly DEFAULT_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: any): void {
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }
  };

  private static readonly LABEL_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: any): void {
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }
    switch (field.field_type.type) {
      case 'FixedList': {
        result[field.id] = FieldsUtils.getFixedListLabelByCodeOrEmpty(field, result[field.id] || field.value);
        break;
      }
      case 'MultiSelectList': {
        const fieldValue = result[field.id] || [];
        result[field.id + FieldsUtils.LABEL_SUFFIX] = [];
        fieldValue.forEach((code: any, idx: any) => {
          result[field.id + FieldsUtils.LABEL_SUFFIX][idx] = FieldsUtils.getFixedListLabelByCodeOrEmpty(field, code);
        });
        break;
      }
      case 'Label': {
        result[field.id] = FieldsUtils.getLabel(field);
        break;
      }
      case 'MoneyGBP': {
        const fieldValue = (result[field.id] || result[field.id] === 0) ? result[field.id] : field.value;
        result[field.id] = FieldsUtils.getMoneyGBP(fieldValue);
        break;
      }
      case 'Date': {
        const fieldValue = (result[field.id] || field.value);
        result[field.id] = FieldsUtils.getDate(fieldValue);
        break;
      }
      case 'Collection': {
        const elements = (result[field.id] || field.value);
        if (elements) {
          elements.forEach((elem: any) => {
            switch (field.field_type.collection_field_type.type) {
              case 'MoneyGBP': {
                elem.value = FieldsUtils.getMoneyGBP(elem.value);
                break;
              }
              case 'Date': {
                elem.value = FieldsUtils.getDate(elem.value);
                break;
              }
            }
          });
        }
        break;
      }
    }
  };

  private static getMoneyGBP(fieldValue: any): string {
    if (!isNaN(parseInt(fieldValue, 10))) {
      return FieldsUtils.currencyPipe.transform(fieldValue / 100, 'GBP', 'symbol');
    }
    return '';
  }

  private static getLabel(fieldValue: CaseField): string {
    return fieldValue ? fieldValue.label : '';
  }

  private static getDate(fieldValue: string): string {
    try {
      // Format specified here wasn't previously working and lots of tests depend on it not working
      // Now that formats work correctly many test would break - and this could affect services which may depend on
      // the orginal behaviour of returning dates in "d MMM yyyy"
      // Note - replaced 'd' with 'D' as datepipe using moment to avoid timezone discrepancies
      return FieldsUtils.datePipe.transform(fieldValue, null, 'D MMM yyyy');
    } catch (e) {
      return this.textForInvalidField('Date', fieldValue);
    }
  }

  private static getFixedListLabelByCodeOrEmpty(field: CaseField, code: string): string {
    const relevantItem: FixedListItem = code ? field.field_type.fixed_list_items.find(item => item.code === code) : null;
    return relevantItem ? relevantItem.label : '';
  }

  private static textForInvalidField(type: string, invalidValue: string): string {
    return `{ Invalid ${type}: ${invalidValue} }`;
  }

  public static addCaseFieldAndComponentReferences (c: AbstractControl, cf: CaseField, comp: AbstractFormFieldComponent): void {
    c['caseField'] = cf;
    c['component'] = comp;
  }

  /**
   * Recursive check of an array or object and its descendants for the presence of any non-empty values.
   *
   * @param object The array or object to check
   * @returns `true` if the array or object (or a descendant) contains at least one non-empty value; `false` otherwise
   */
  public static containsNonEmptyValues(object: object): boolean {
    if (!object) {
      return false;
    }
    const values = Object.keys(object).map(key => object[key]);
    const objectRefs = [];
    // Also test for numeric values, and length > 0 for non-numeric values because this covers both strings and arrays.
    // Note: Deliberate use of non-equality (!=) operator for null check, to handle both null and undefined values.
    const hasNonNullPrimitive = values.some(x => (x != null &&
      ((typeof x === 'object' && x.constructor === Object) || Array.isArray(x)
        ? !objectRefs.push(x)
        : typeof x === 'number' || x.length > 0)
    ));
    return !hasNonNullPrimitive ? objectRefs.some(y => this.containsNonEmptyValues(y)) : hasNonNullPrimitive;
  }

  public buildCanShowPredicate(eventTrigger: CaseEventTrigger, form: any): Predicate<WizardPage> {
    const currentState = this.getCurrentEventState(eventTrigger, form);
    return (page: WizardPage): boolean => {
      return page.parsedShowCondition.match(currentState);
    };
  }

  public getCurrentEventState(eventTrigger: any, form: FormGroup): any {
    return this.mergeCaseFieldsAndFormFields(eventTrigger.case_fields, form.controls['data'].value);
  }

  public cloneCaseField(obj: any): CaseField {
    return Object.assign(new CaseField(), obj);
  }

  public mergeCaseFieldsAndFormFields(caseFields: CaseField[], formFields: any): any {
    return this.mergeFields(caseFields, formFields, FieldsUtils.DEFAULT_MERGE_FUNCTION);
  }

  public mergeLabelCaseFieldsAndFormFields(caseFields: CaseField[], formFields: any): any {
    return this.mergeFields(caseFields, formFields, FieldsUtils.LABEL_MERGE_FUNCTION);
  }

  public controlIterator(
    aControl: AbstractControl,
    formArrayFn: (a: FormArray) => void,
    formGroupFn: (g: FormGroup) => void,
    controlFn: (c: FormControl) => void): void {
    if (aControl instanceof FormArray) { // We're in a collection
      formArrayFn(aControl);
    } else if (aControl instanceof FormGroup) { // We're in a complex type.
      formGroupFn(aControl)
    } else if (aControl instanceof FormControl) { // FormControl
      controlFn(aControl);
    }
  }

  private mergeFields(
    caseFields: CaseField[],
    formFields: any,
    mergeFunction: (field: CaseField, result: any) => void): any {
    const result = FieldsUtils.cloneObject(formFields);
    caseFields.forEach(field => {
      mergeFunction(field, result);
      if (field.field_type && field.field_type.complex_fields && field.field_type.complex_fields.length > 0) {
        result[field.id] = this.mergeFields(field.field_type.complex_fields, result[field.id], mergeFunction);
      }
    });
    return result;
  }
}
