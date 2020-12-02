import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeSanitiser } from './field-type-sanitiser';
import { FieldsUtils } from '../fields';

@Injectable()
export class FormValueService {
  public static readonly LABEL_SUFFIX = '-LABEL';

  /**
   * Gets value of a field based on fieldKey which is a dot separated reference to value and collection index.
   * There are two exeptions:
   * 1) In case of a multiselect being identified as a leaf a '-LABEL' suffix is appended to the key and values og that key are returned
   *      form= { 'list': ['code1', 'code2'],
   *              'list-LABEL': ['label1', 'label2'] },
   *      fieldKey=list,
   *      colIndex=0,
   *      value=label1, label2
   * 2) In case of a collection of simple fields is identified as a leaf all values are joined seperated by a comma
   *      form= { 'collection': [{ 'value': 'value1' }, { 'value': 'value2' }] }
   *      fieldKey=collection
   *      colIndex=1
   *      value=value1, value2
   *
   * Other examples:
   * 1) simple field reference: form={ 'PersonFirstName': 'John' }, fieldKey=PersonFirstName, value=John
   * 2) complex field reference:
   *      form= { complex1': {
                    'simple11': 'value11',
                    'simple12': 'value12',
                    'complex2': {
                      'simple21': 'value21'
                    }
                }},
   *      fieldKey=complex1.complex2.simple21
   *      colIndex=0,
   *      value=value21
   * 3) complex field with collection field with complex field reference:
   *      form= { 'complex1': {
   *               'collection1': [
   *               { 'value': {
   *                   'complex2': {
   *                     'simple1': 'value1',
   *                     'complex3': {
   *                       'complex4': {
   *                         'simple2': 'value12'
   *                       }
   *                     }
   *                   }
   *                 }
   *               },
   *               { 'value': {
   *                   'complex2': {
   *                     'simple1': 'value2',
   *                     'complex3': {
   *                       'complex4': {
   *                         'simple2': 'value21'
   *                       }
   *                     }
   *                   }
   *                 }
   *               },
   *               { 'value': {
   *                   'complex2': {
   *                     'simple1': 'value3',
   *                     'complex3': {
   *                       'complex4': {
   *                         'simple2': 'value31'
   *                       }
   *                     }
   *                   }
   *                 }
   *               }
   *             ]}}
   *      fieldKey=complex1.collection1.complex2.complex3.complex4.simple2
   *      colIndex=2,
   *      value=value21
   * 4) collection of complex types
   *      form= { 'collection1': [
   *               { 'value': {'complex1': {
   *                             'simple1': 'value11',
   *                             'complex2': {
   *                               'complex3': {
   *                                 'simple2': 'value12'
   *                               }
   *                             }
   *                         }}
   *               },
   *               { 'value': {'complex1': {
   *                             'simple1': 'value21',
   *                             'complex2': {
   *                               'complex3': {
   *                                 'simple2': 'value22'
   *                               }
   *                             }
   *                         }}
   *               },
   *               { 'value': {'complex1': {
   *                             'simple1': 'value31',
   *                             'complex2': {
   *                               'complex3': {
   *                                 'simple2': 'value32'
   *                               }
   *                             }
   *                           }}
   *               }
   *             ]}
   *      fieldKey=collection1.complex1.complex2.complex3.simple2
   *      colIndex=2
   *      value=value32
   *
   * If key is pointing at a complex or collection leaf (not simple, collection of simple or multiselect types) then undefined is returned.
   * Also no key referring a leaf that is contained within collection will contain index number. The index is passed as an argument to the
   * method.
   * @param form form
   * @param fieldKey dot separated reference to value
   * @param colIndex index of collection item being referenced or 0 otherwise
   * @returns {string} simple or combined value of a field
   **/
  public static getFieldValue(form, fieldKey, colIndex) {
    let fieldIds = fieldKey.split('.');
    let currentFieldId = fieldIds[0];
    let currentForm = form[currentFieldId];
    if (FieldsUtils.isMultiSelectValue(currentForm)) {
        return form[currentFieldId + FormValueService.LABEL_SUFFIX].join(', ');
    } else if (FieldsUtils.isCollectionOfSimpleTypes(currentForm)) {
        return currentForm.map(fieldValue => fieldValue['value']).join(', ');
    } else if (FieldsUtils.isCollection(currentForm)) {
        return this.getFieldValue(currentForm[colIndex]['value'], fieldIds.slice(1).join('.'), colIndex);
    } else if (FieldsUtils.isNonEmptyObject(currentForm)) {
        return this.getFieldValue(currentForm, fieldIds.slice(1).join('.'), colIndex);
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
    const documentFieldKeys = ['document_url', 'document_binary_url', 'document_filename'];
    Object.keys(rawObject).forEach(key => {
      // If the key is one of documentFieldKeys, it means the field is of Document type. If the value of any of these
      // properties is null, the entire sanitised object to be returned should be null
      if (documentFieldKeys.indexOf(key) > -1 && rawObject[key] == null) {
        sanitisedObject = null;
      } else if ('CaseReference' === key) {
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
      if (item && item.hasOwnProperty('value')) {
        item.value = this.sanitiseValue(item.value);
      }
    });

    // Filter the array to ensure only truthy values are returned; double-bang operator returns the boolean true/false
    // association of a value. In addition, if the array contains items with a "value" object property, return only
    // those whose value object contains non-empty values, including for any descendant objects
    return rawArray.filter(item => !!item).filter(item => item.value ? this.containsNonEmptyValues(item.value) : true);
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

  /**
   * Recursive check of an object and its descendants for the presence of any non-empty values.
   *
   * @param object The object to check
   */
  private containsNonEmptyValues(object: object): boolean {
    const values = Object.keys(object).map(key => object[key]);
    const objectRefs = [];
    // Note that pushing to an array is truthy (returns new length of the array), hence using ! to make it falsy
    const hasNonNullPrimitive = values.some(x => (x !== null &&
      (typeof x === 'object' && x.constructor === Object ? !objectRefs.push(x) : x !== '')));
    return !hasNonNullPrimitive ? objectRefs.some(y => this.containsNonEmptyValues(y)) : hasNonNullPrimitive;
  }
}
