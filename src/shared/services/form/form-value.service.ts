import { Injectable } from '@angular/core';

import { CaseEventData, CaseField } from '../../domain';
import { FieldsUtils } from '../fields';
import { FieldTypeSanitiser } from './field-type-sanitiser';

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

  private static isReadOnly(field: CaseField): boolean {
    return field.display_context ? field.display_context.toUpperCase() === 'READONLY' : false;
  }

  private static isOptional(field: CaseField): boolean {
    return field.display_context ? field.display_context.toUpperCase() === 'OPTIONAL' : false;
  }

  private static isLabel (field: CaseField): boolean {
    if (field.field_type) {
      return field.field_type.type === 'Label';
    } else {
      return false;
    }
  }

  private static isEmptyData(data: Object): boolean {
    if (data) {
      let allEmpty = true;
      for (const prop of Object.keys(data)) {
        const value = data[prop];
        if (value) {
          if (typeof(value) === 'object') {
            allEmpty = allEmpty && this.isEmptyData(value);
          } else {
            allEmpty = false;
          }
        }
      }
      return allEmpty;
    }
    return true;
  }

  /**
   * Should we clear out optional, empty, complex objects?
   * @param clearEmpty False property if we simply want to skip it.
   * @param data The data to assess for "emptiness".
   * @param field The CaseField that will tell us if this is optional.
   */
  private static clearOptionalEmpty(clearEmpty: boolean, data: Object, field: CaseField): boolean {
    if (clearEmpty) {
      return FormValueService.isOptional(field) && FormValueService.isEmptyData(data);
    }
    return false;
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

  filterCurrentPageFields(caseFields: CaseField[], editForm: any): any {
    let cloneForm = JSON.parse(JSON.stringify(editForm));
    Object.keys(cloneForm['data']).forEach((key) => {
      if (caseFields.findIndex((element) => element.id === key) < 0) {
        delete cloneForm['data'][key];
      }
    });
    return cloneForm;
  }

  sanitiseDynamicLists(caseFields: CaseField[], editForm: any): any {
    return this.fieldTypeSanitiser.sanitiseLists(caseFields, editForm.data);
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
    // association of a value
    return rawArray.filter(item => !!item);
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
  public clearNonCaseFields(data: object, caseFields: CaseField[]) {
    for (let dataKey in data) {
      if (!caseFields.find(cf => cf.id === dataKey)) {
        delete data [dataKey];
      }
    }
  }
  // TODO refactor so that this and remove unnecessary fields have a common iterator that applies functions to each node visited
  public removeNullLabels(data: object, caseFields: CaseField[]) {
    if (data && caseFields && caseFields.length > 0) {
      // check if there is any data at the top level of the form that's not in the caseFields
      for (const field of caseFields) {
        if (field.field_type) {
          switch (field.field_type.type) {
            case 'Label':
              // Delete any labels that are null
              if ((data[field.id] === null) || (data[field.id] === '')) {
                delete data[field.id];
              }
              break;
            case 'Complex':
              // Recurse and remove anything unnecessary from within a complex field.
              this.removeNullLabels(data[field.id], field.field_type.complex_fields);
              break;
            case 'Collection':
              // Get hold of the collection.
              const collection = data[field.id];
              // Check if we actually have a collection to work with.
              if (collection && Array.isArray(collection)) {
                // If this is a collection of complex object, we need to iterate through
                // and clear them out.
                if (field.field_type.collection_field_type.type === 'Complex') {
                  // Iterate through the elements and remove any unnecessary fields within.
                  for (const item of collection) {
                    this.removeNullLabels(item, field.field_type.collection_field_type.complex_fields);
                    this.removeNullLabels(item.value, field.field_type.collection_field_type.complex_fields);
                  }
                }
              }
              break;
            default:
              break;
          }
        }
      }
    }
  }
  // TODO refactor so that this and remove unnecessary fields have a common iterator that applies functions to each node visited
  public removeEmptyDocuments(data: object, caseFields: CaseField[]) {
    if (data && caseFields && caseFields.length > 0) {
      // check if there is any data at the top level of the form that's not in the caseFields
      for (const field of caseFields) {
        if (field.field_type) {
          switch (field.field_type.type) {
            case 'Complex':
              // Recurse and remove any empty documents from within a complex field.
              this.removeEmptyDocuments(data[field.id], field.field_type.complex_fields);
              break;
            case 'Collection':
              // Get hold of the collection.
              const collection = data[field.id];
              // Check if we actually have a collection to work with.
              if (collection && Array.isArray(collection)) {
                // If this is a collection of complex object, we need to iterate through
                // and clear out empty documents
                if (field.field_type.collection_field_type.type === 'Complex') {
                  // Iterate through the elements and remove any empty documents within.
                  for (const item of collection) {
                    this.removeEmptyDocuments(item, field.field_type.collection_field_type.complex_fields);
                    this.removeEmptyDocuments(item.value, field.field_type.collection_field_type.complex_fields);
                  }
                }
              }
              break;
            case 'Document':
              if (FormValueService.isEmptyData(data[field.id])) {
                delete data[field.id];
              }
              break;
            default:
              break;
          }
        }
      }
    }
  }
  /**
   * Clear out unnecessary fields from a data object, based on an array of CaseFields.
   * This method is recursive and will call itself if it encounters particular field types.
   *
   * @param data The object to be tidied up.
   * @param caseFields The CaseFields that need to be cleaned up.
   * @param clearEmpty Whether or not we should clear out empty, optional, complex objects.
   * @param clearNonCase Whether or not we should clear out non-case fields at the top level.
   */
  public removeUnnecessaryFields(data: object, caseFields: CaseField[], clearEmpty = false, clearNonCase = false): void {
    if (data && caseFields && caseFields.length > 0) {
      // check if there is any data at the top level of the form that's not in the caseFields
      if (clearNonCase) {
        this.clearNonCaseFields(data, caseFields);
      }
      for (const field of caseFields) {
        if (!FormValueService.isLabel(field) && FormValueService.isReadOnly(field)) {
          // Retain anything that is readonly and not a label.
          continue;
        }
        if (field.hidden === true && field.display_context !== 'HIDDEN') {
          // Delete anything that is hidden (that is NOT readonly), and that
          // hasn't had its display_context overridden to make it hidden.
          delete data[field.id];
        } else if (field.field_type) {
          switch (field.field_type.type) {
            case 'Label':
              // Delete any labels.
              delete data[field.id];
              break;
            case 'Document':
              if (FormValueService.isEmptyData(data[field.id])) {
                delete data[field.id];
              }
              break;
            case 'Complex':
              // Recurse and remove anything unnecessary from within a complex field.
              this.removeUnnecessaryFields(data[field.id], field.field_type.complex_fields, clearEmpty);
              // Also remove any optional complex objects that are completely empty.
              if (FormValueService.clearOptionalEmpty(clearEmpty, data[field.id], field)) {
                delete data[field.id];
              }
              break;
            case 'Collection':
              // Get hold of the collection.
              const collection = data[field.id];
              // Check if we actually have a collection to work with.
              if (collection && Array.isArray(collection)) {
                // If this is a collection of complex object, we need to iterate through
                // and clear them out.
                if (field.field_type.collection_field_type.type === 'Complex') {
                  // Iterate through the elements and remove any unnecessary fields within.
                  for (const item of collection) {
                    this.removeUnnecessaryFields(item, field.field_type.collection_field_type.complex_fields, clearEmpty);
                    this.removeUnnecessaryFields(item.value, field.field_type.collection_field_type.complex_fields, false);
                  }
                }
              }
              break;
            default:
              break;
          }
        }
      }
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
