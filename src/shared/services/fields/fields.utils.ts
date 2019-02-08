import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition';
import { CurrencyPipe } from '@angular/common';
import { DatePipe } from '../../components/palette/utils';
import { WizardPage } from '../../components/case-editor/domain';
import { Predicate } from '../../domain/predicate.model';
import { CaseView } from '../../domain/case-view';

// @dynamic
@Injectable()
export class FieldsUtils {

  private static readonly currencyPipe: CurrencyPipe = new CurrencyPipe('en-GB');
  private static readonly datePipe: DatePipe = new DatePipe();
  public static readonly LABEL_SUFFIX = '-LABEL';

  public static toValuesMap(caseFields: CaseField[]): any {
    let valueMap = {};
    caseFields.forEach(field => {
      valueMap[field.id] = FieldsUtils.prepareValue(field);
    });
    return valueMap;
  }

  private static prepareValue(field: CaseField) {
    if (field.value) {
      return field.value;
    } else if (field.field_type.type === 'Complex') {
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

  public buildCanShowPredicate(eventTrigger, form): Predicate<WizardPage> {
    let currentState = this.mergeCaseFieldsAndFormFields(eventTrigger.case_fields, form.controls['data'].value);
    return (page: WizardPage): boolean => {
      return page.parsedShowCondition.match(currentState);
    };
  }

  mergeCaseFieldsAndFormFields(caseFields: CaseField[], formFields: any): any {
    return this.mergeFields(caseFields, formFields, FieldsUtils.DEFAULT_MERGE_FUNCTION);
  }

  mergeLabelCaseFieldsAndFormFields(caseFields: CaseField[], formFields: any): any {
    return this.mergeFields(caseFields, formFields, FieldsUtils.LABEL_MERGE_FUNCTION);
  }

  private mergeFields(caseFields: CaseField[], formFields: any, mergeFunction: (CaseField, any) => void) {
    let result = this.cloneObject(formFields);
    caseFields.forEach(field => {
      mergeFunction(field, result);
      if (field.field_type && field.field_type.complex_fields && field.field_type.complex_fields.length > 0) {
        result[field.id] = this.mergeFields(field.field_type.complex_fields, result[field.id], mergeFunction);
      }
    });
    return result;
  }

  private cloneObject(obj: any): any {
    return Object.assign({}, obj);
  }

  showGreyBar(caseField: CaseField, element: HTMLElement) {
    if (caseField.field_type.type !== 'Collection') {
      if (element) {
        if ( !this.isCYAPage(element) ) {  // && this.isSamePage(caseField, element)
          let divSelector = element.querySelector('div')
          if (divSelector) {
            divSelector.classList.add('show-condition-grey-bar');
          }
        }
      }
    }
  }

  private isCYAPage(element: HTMLElement): boolean {
    let formElement = this.searchParentByTag(element, 'FORM');
    return (formElement && formElement.classList.contains('check-your-answers'));
  }

  private isSamePage(caseField: CaseField, element: HTMLElement): boolean {

    let cefElement = this.searchParentByTag(element, 'CCD-CASE-EDIT-FORM');
    let idElements: HTMLCollectionOf<Element>;
    if ( cefElement ) {
      idElements = cefElement.children;
    }
    let idList = [];
    if ( idElements ) {
      for (let i = 0; i < idElements.length; i++) {
        let formControlElement = idElements[i].querySelector('.form-control');
        if ( formControlElement && formControlElement.id ) {
          idList.push(formControlElement.id.replace(/-yes|-no/gi, ''));
        }
      }
    }
    let condFields = this.getConditionFields(caseField.show_condition);
    return condFields.every(cond => {
      return ( idList.indexOf(cond) !== -1 );
    });
  }

  private searchParentByTag(element: HTMLElement, tag: string): HTMLElement {
    if (element) {
      let tempElement = element.parentElement;
      while (tempElement.parentElement) {
        if (tempElement.tagName === tag) {
          return tempElement;
        }
        tempElement = tempElement.parentElement;
      }
    }
    return undefined;
  }

  private getConditionFields(condition: string): any[] {
    let condFields = [];
    let conditions = condition.split('AND');
    conditions.forEach(cond => condFields.push(cond.split('=')[0].trim()));
    return condFields;
  }
}
