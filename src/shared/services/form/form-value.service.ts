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
      } else{
        caseFields.forEach(function (e) {
          console.log(e);
          if ( e.id === key && e.field_type.type === 'DynamicList'){
            cloneForm['data'][key] = JSON.parse(cloneForm['data'][key]);
          }
        });
      }
    });
    return cloneForm;
  }

}
