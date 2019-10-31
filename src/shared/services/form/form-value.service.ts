import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeSanitiser } from './field-type-sanitiser';
import { FieldsUtils } from '../fields';

@Injectable()
export class FormValueService {
  public static readonly LABEL_SUFFIX = '-LABEL';

  public static getFieldValue(pageFormFields, fieldIdToSubstitute, collectionIndex) {
    let fieldIds = fieldIdToSubstitute.split('.');
    let currentFieldId = fieldIds[0];
    let currentForm = pageFormFields[currentFieldId];
    if (FieldsUtils.isMultiSelectValue(currentForm)) {
        return pageFormFields[currentFieldId + FormValueService.LABEL_SUFFIX];
    } else if (FieldsUtils.isCollectionOfSimpleTypes(currentForm)) {
        return currentForm.map(fieldValue => fieldValue['value']);
    } else if (FieldsUtils.isCollection(currentForm)) {
        return this.getFieldValue(currentForm[collectionIndex]['value'], fieldIds.slice(1).join('.'), collectionIndex);
    } else if (FieldsUtils.isNonEmptyObject(currentForm)) {
        return this.getFieldValue(currentForm, fieldIds.slice(1).join('.'), collectionIndex);
    } else {
        return currentForm;
    }
  }

  constructor(private fieldTypeSanitiser: FieldTypeSanitiser) {
  }

  public sanitise(rawValue: object): object {
    return this.sanitiseObject(rawValue);
  }

  public sanitiseCaseReference(reference: string): string {
    // strip non digits
    const s: string = reference.replace(/[\D]/g, '');
    if (s.length > 16) {
      return s.substr(s.length - 16, 16);
    }
    return s;
  }

  filterCurrentPageFields(caseFields: CaseField[], editFrom: any): any {
    let cloneForm = JSON.parse(JSON.stringify(editFrom));
    Object.keys(cloneForm['data']).forEach((key) => {
      if (caseFields.findIndex((element) => element.id === key) < 0) {
        delete cloneForm['data'][key];
      }
    });
    return cloneForm;
  }

  sanitiseDynamicLists(caseFields: CaseField[], editForm: any): any {
    return this.fieldTypeSanitiser.sanitiseLists(caseFields, editForm);
  }

  private sanitiseObject(rawObject: object): object {
    if (!rawObject) {
      return rawObject;
    }

    let sanitisedObject = {};
    Object.keys(rawObject).forEach(key => {
      if ('CaseReference' === key) {
        sanitisedObject[key] = this.sanitiseValue(this.sanitiseCaseReference(String(rawObject[key])));
      } else {
        sanitisedObject[key] = this.sanitiseValue(rawObject[key]);
      }
    });
    return sanitisedObject;
  }

  private sanitiseArray(rawArray: any[]): any[] {
    if (!rawArray) {
      return rawArray;
    }

    rawArray.forEach(item => {
      if (item.hasOwnProperty('value')) {
        item.value = this.sanitiseValue(item.value);
      }
    });

    return rawArray;
  }

  private sanitiseValue(rawValue: any): any {
    if (Array.isArray(rawValue)) {
      return this.sanitiseArray(rawValue);
    }

    switch (typeof rawValue) {
      case 'object':
        return this.sanitiseObject(rawValue);
      case 'string':
        return rawValue.trim();
      case 'number':
        return String(rawValue);
      default:
        return rawValue;
    }
  }

}
