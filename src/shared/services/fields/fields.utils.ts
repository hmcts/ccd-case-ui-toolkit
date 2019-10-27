import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition';
import { CurrencyPipe, } from '@angular/common';
import { DatePipe } from '../../components/palette/utils';
import { WizardPage } from '../../components/case-editor/domain';
import { Predicate } from '../../domain/predicate.model';
import { CaseView } from '../../domain/case-view';
import { plainToClassFromExist } from 'class-transformer';

// @dynamic
@Injectable()
export class FieldsUtils {

  private static readonly currencyPipe: CurrencyPipe = new CurrencyPipe('en-GB');
  private static readonly datePipe: DatePipe = new DatePipe();
  public static readonly LABEL_SUFFIX = '-LABEL';

  public static convertToCaseField(obj: any): CaseField {
    if (!(obj instanceof CaseField)) {
      return plainToClassFromExist(new CaseField(), obj);
    }
    return obj;
  }

  public static toValuesMap(caseFields: CaseField[]): any {
    let valueMap = {};
    caseFields.forEach(field => {
      valueMap[field.id] = FieldsUtils.prepareValue(field);
    });
    return valueMap;
  }

  public static getType(elem): string {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }

  public static isObject(elem) {
      return this.getType(elem) === 'Object';
  };

  public static isArray(elem) {
      return this.getType(elem) === 'Array';
  };

  public static isSimpleArray(fieldValue) {
      return !this.isObject(fieldValue[0]) && !Array.isArray(fieldValue[0]) && fieldValue[0] !== undefined;
  }

  public static isSimpleTypeOrCollectionOfSimpleTypes(fieldValue) {
      return !this.isObject(fieldValue) && (this.isArray(fieldValue) ? this.isSimpleArray(fieldValue) : true);
  }

  public static isNonEmptyArray(pageFormFields) {
      return Array.isArray(pageFormFields) && pageFormFields[0];
  }

  public static isCollection(pageFormFields) {
      return this.isNonEmptyArray(pageFormFields) && this.isCollectionWithValue(pageFormFields);
  }

  public static isCollectionWithValue(pageFormFields) {
      return pageFormFields[0]['value'];
  }

  public static cloneObject(obj: any): any {
    return Object.assign({}, obj);
  }

  // temporary function until this can be moved to CaseView class (RDM-2681)
  public static getCaseFields(caseView: CaseView): CaseField[] {
    let caseDataFields = caseView.tabs.reduce((acc, tab) => {
      return acc.concat(tab.fields);
    }, []);

    let metadataFields = caseView.metadataFields;
    return metadataFields.concat(caseDataFields.filter(function (caseField) {
      return metadataFields.findIndex(metadataField => metadataField.id === caseField.id) < 0;
    }));
  }

  private static prepareValue(field: CaseField) {
    if (field.value) {
      return field.value;
    } else if (field.isComplex()) {
      let valueMap = {};
      field.field_type.complex_fields.forEach(complexField => {
        valueMap[complexField.id] = FieldsUtils.prepareValue(complexField);
      });
      return valueMap;
    }
  }

  private static readonly DEFAULT_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: any) {
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }
  };

  private static readonly LABEL_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: any) {
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }
    switch (field.field_type.type) {
      case 'FixedList': {
        result[field.id] = FieldsUtils.getFixedListLabelByCodeOrEmpty(field, result[field.id] || field.value);
        break;
      }
      case 'MultiSelectList': {
        let fieldValue = result[field.id] || [];
        result[field.id + FieldsUtils.LABEL_SUFFIX] = [];
        fieldValue.forEach((code, idx) => {
          result[field.id + FieldsUtils.LABEL_SUFFIX][idx] = FieldsUtils.getFixedListLabelByCodeOrEmpty(field, code);
        });
        break;
      }
      case 'MoneyGBP': {
        let fieldValue = (result[field.id] || field.value);
        result[field.id] = FieldsUtils.getMoneyGBP(fieldValue);
        break;
      }
      case 'Date': {
        let fieldValue = (result[field.id] || field.value);
        result[field.id] = FieldsUtils.getDate(fieldValue);
        break;
      }
      case 'Collection': {
        let elements = (result[field.id] || field.value);
        if (elements) {
          elements.forEach(elem => {
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

  private static getMoneyGBP(fieldValue) {
    return fieldValue ? FieldsUtils.currencyPipe.transform(fieldValue / 100, 'GBP', 'symbol') : fieldValue;
  }

  private static getDate(fieldValue) {
    try {
      return FieldsUtils.datePipe.transform(fieldValue, null, 'dd-MM-yyyy');
    } catch (e) {
      return this.textForInvalidField('Date', fieldValue);
    }
  }

  private static getFixedListLabelByCodeOrEmpty(field, code) {
    let relevantItem = code ? field.field_type.fixed_list_items.find(item => item.code === code) : '';
    return relevantItem ? relevantItem.label : '';
  }

  private static textForInvalidField(type: string, invalidValue: string): string {
    return `{ Invalid ${type}: ${invalidValue} }`;
  }

  public buildCanShowPredicate(eventTrigger, form): Predicate<WizardPage> {
    let currentState = this.getCurrentEventState(eventTrigger, form);
    return (page: WizardPage): boolean => {
      return page.parsedShowCondition.match(currentState);
    };
  }

  public getCurrentEventState(eventTrigger, form): any {
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

  private mergeFields(caseFields: CaseField[], formFields: any, mergeFunction: (CaseField, any) => void) {
    let result = FieldsUtils.cloneObject(formFields);
    caseFields.forEach(field => {
      mergeFunction(field, result);
      if (field.field_type && field.field_type.complex_fields && field.field_type.complex_fields.length > 0) {
        result[field.id] = this.mergeFields(field.field_type.complex_fields, result[field.id], mergeFunction);
      }
    });
    return result;
  }

}
