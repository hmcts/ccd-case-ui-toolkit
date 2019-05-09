import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';

@Injectable()
export class FormValueService {

  public sanitise(rawValue: object): object {
    return this.sanitiseObject(rawValue);
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

  public sanitiseCaseReference(reference: string): string {
    // strip non digits
    const s: string = reference.replace(/[\D]/g, '');
    if (s.length > 16) {
      return s.substr(s.length - 16, 16);
    }
    return s;
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
    // loop thorught dynamic fields in caseFields
    caseFields
      .filter(caseField => caseField.field_type.type === 'DynamicList')
      .forEach(dynamicField => {
        // for each dynamic field find the field in editForm, if field exists in the editForm
        // get the code (selected value from user)
        // replace code in editForm with whole JSON for dynamic list
        Object.keys(editForm['data']).forEach((key) => {
          if (dynamicField.id === key) {
            editForm['data'][key] =
              {
                value: dynamicField.value.list_items.filter(value => value.code === editForm['data'][key])[0],
                list_items: dynamicField.value.list_items
              };
          }
        });
      });


  }

}
