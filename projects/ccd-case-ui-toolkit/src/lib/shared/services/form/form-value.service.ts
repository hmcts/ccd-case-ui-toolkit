import { Injectable } from '@angular/core';
import { CaseField, FieldTypeEnum } from '../../domain';
import { FieldsUtils } from '../fields';
import { FieldTypeSanitiser } from './field-type-sanitiser';

@Injectable()
export class FormValueService {
  public static getFieldValue(form, fieldKey, colIndex) {
    const fieldIds = fieldKey.split('.');
    const currentFieldId = fieldIds[0];
    const currentForm = form[currentFieldId];
    if (FieldsUtils.isMultiSelectValue(currentForm)) {
      return form[currentFieldId + FieldsUtils.LABEL_SUFFIX].join(', ');
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

  /**
   * A recursive method to remove anything with a `---LABEL` suffix.
   * @param data The data to recurse through and remove MultiSelect labels.
   */
  public static removeMultiSelectLabels(data: any): void {
    if (data && typeof data === 'object') {
      if (Array.isArray(data)) {
        for (const item of data) {
          FormValueService.removeMultiSelectLabels(item);
        }
      } else {
        const keys: string[] = Object.keys(data);
        for (const key of keys) {
          // Have we found one a MultiSelect label?
          if (key.indexOf(FieldsUtils.LABEL_SUFFIX) > 0) {
            // If so, remove it.
            delete data[key];
          } else {
            FormValueService.removeMultiSelectLabels(data[key]);
          }
        }
      }
    }
  }

  private static isReadOnly(field: CaseField): boolean {
    return field.display_context ? field.display_context.toUpperCase() === 'READONLY' : false;
  }

  private static isOptional(field: CaseField): boolean {
    return field.display_context ? field.display_context.toUpperCase() === 'OPTIONAL' : false;
  }

  private static isLabel(field: CaseField): boolean {
    if (field.field_type) {
      return field.field_type.type === 'Label';
    } else {
      return false;
    }
  }

  private static isEmptyData(data: object): boolean {
    if (data) {
      let allEmpty = true;
      for (const prop of Object.keys(data)) {
        const value = data[prop];
        if (value) {
          if (typeof (value) === 'object') {
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
  private static clearOptionalEmpty(clearEmpty: boolean, data: object, field: CaseField): boolean {
    if (clearEmpty) {
      return FormValueService.isOptional(field) && FormValueService.isEmptyData(data);
    }
    return false;
  }

  constructor(private readonly fieldTypeSanitiser: FieldTypeSanitiser) {
  }

  public sanitise(rawValue: object, isCaseFlagJourney: boolean = false): object {
    return this.sanitiseObject(rawValue, isCaseFlagJourney);
  }

  public sanitiseCaseReference(reference: string): string {
    // strip non digits
    const s: string = reference.replace(/[\D]/g, '');
    if (s.length > 16) {
      return s.substr(s.length - 16, 16);
    }
    return s;
  }

  public filterCurrentPageFields(caseFields: CaseField[], editForm: any): any {
    const cloneForm = JSON.parse(JSON.stringify(editForm));
    Object.keys(cloneForm['data']).forEach((key) => {
      if (caseFields.findIndex((element) => element.id === key) < 0) {
        delete cloneForm['data'][key];
      }
    });
    return cloneForm;
  }

  public sanitiseDynamicLists(caseFields: CaseField[], editForm: any): any {
    return this.fieldTypeSanitiser.sanitiseLists(caseFields, editForm.data);
  }

  private sanitiseObject(rawObject: object, isCaseFlagJourney: boolean = false): object {
    if (!rawObject) {
      return rawObject;
    }

    let sanitisedObject = {};
    const documentFieldKeys = ['document_url', 'document_binary_url', 'document_filename'];
    for (const key in rawObject) {
      // If the key is one of documentFieldKeys, it means the field is of Document type. If the value of any of these
      // properties is null, the entire sanitised object to be returned should be null
      if (documentFieldKeys.indexOf(key) > -1 && rawObject[key] === null) {
        sanitisedObject = null;
        break;
      } else if ('CaseReference' === key) {
        sanitisedObject[key] = this.sanitiseValue(this.sanitiseCaseReference(String(rawObject[key])), isCaseFlagJourney);
      } else {
        sanitisedObject[key] = this.sanitiseValue(rawObject[key], isCaseFlagJourney);
        if (Array.isArray(sanitisedObject[key])) {
          // If the 'sanitised' array is empty, whereas the original array had 1 or more items
          // delete the property from the sanatised object
          const shouldDeleteField = sanitisedObject[key].length === 0
            && rawObject[key].length > 0
            && !isCaseFlagJourney;
          if (shouldDeleteField) {
            delete sanitisedObject[key];
          }
        }
      }
    }
    return sanitisedObject;
  }

  private sanitiseArray(rawArray: any[], isCaseFlagJourney: boolean = false): any[] {
    if (!rawArray) {
      return rawArray;
    }

    rawArray.forEach(item => {
      if (item && item.hasOwnProperty('value')) {
        item.value = this.sanitiseValue(item.value, isCaseFlagJourney);
      }
    });

    // Filter the array to ensure only truthy values are returned; double-bang operator returns the boolean true/false
    // association of a value. In addition, if the array contains items with a "value" object property, return only
    // those whose value object contains non-empty values, including for any descendant objects
    return rawArray
      .filter(item => !!item)
      .filter(item => item.hasOwnProperty('value') ? FieldsUtils.containsNonEmptyValues(item.value) : true);
  }

  private sanitiseValue(rawValue: any, isCaseFlagJourney: boolean = false): any {
    if (Array.isArray(rawValue)) {
      return this.sanitiseArray(rawValue, isCaseFlagJourney);
    }

    switch (typeof rawValue) {
      case 'object':
        return this.sanitiseObject(rawValue, isCaseFlagJourney);
      case 'string':
        return rawValue.trim();
      case 'number':
        return String(rawValue);
      default:
        return rawValue;
    }
  }

  public clearNonCaseFields(data: object, caseFields: CaseField[]) {
    for (const dataKey in data) {
      if (!caseFields.find(cf => cf.id === dataKey)) {
        delete data[dataKey];
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
              // Ensure this is executed only if the Document field is NOT hidden and is empty of data; hidden Document
              // fields are handled by the filterRawFormValues() function in CaseEditSubmit component
              if (field.hidden !== true && FormValueService.isEmptyData(data[field.id])) {
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
  public removeUnnecessaryFields(data: object, caseFields: CaseField[], clearEmpty = false, clearNonCase = false,
    fromPreviousPage = false, currentPageCaseFields = []): void {
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
        if (field.hidden === true && field.display_context !== 'HIDDEN' && field.display_context !== 'HIDDEN_TEMP' && field.id !== 'caseLinks' && !field.retain_hidden_value) {
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
              this.removeUnnecessaryFields(data[field.id], field.field_type.complex_fields, clearEmpty);
              // Also remove any optional complex objects that are completely empty.
              // EUI-4244: Ritesh's fix, passing true instead of clearEmpty.
              if (FormValueService.clearOptionalEmpty(true, data[field.id], field)) {
                delete data[field.id];
              }
              if (data[field.id] && FormValueService.isEmptyData(data[field.id]) && fromPreviousPage
                && currentPageCaseFields.findIndex((cField: any) => cField.id === field.id) === -1) {
                delete data[field.id];
              }
              break;
            case 'Collection':
              // Check for valid collection data
              this.removeInvalidCollectionData(data, field);
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

    // Clear out any MultiSelect labels.
    FormValueService.removeMultiSelectLabels(data);
  }

  public removeInvalidCollectionData(data: object, field: CaseField) {
    if (data[field.id] && data[field.id].length > 0) {
      for (const objCollection of data[field.id]) {
        if (Object.keys(objCollection).length === 1 && Object.keys(objCollection).indexOf('id') > -1) {
          data[field.id] = [];
        }
      }
    }
  }

  /**
   * Remove any empty collection fields where a value of greater than zero is specified in the field's {@link FieldType}
   * `min` attribute.
   *
   * @param data The object tree of form values on which to perform the removal
   * @param caseFields The list of underlying {@link CaseField} domain model objects for each field
   */
  public removeEmptyCollectionsWithMinValidation(data: object, caseFields: CaseField[]): void {
    if (data && caseFields && caseFields.length > 0) {
      for (const field of caseFields) {
        if (field.field_type.type === 'Collection' && typeof field.field_type.min === 'number' && field.field_type.min > 0 &&
          data[field.id] && Array.isArray(data[field.id]) && data[field.id].length === 0) {
          delete data[field.id];
        }
      }
    }
  }

  /**
   * Remove from the top level of the form data any case fields of a given type or types that are not intended to be
   * persisted. This function is intended to remove "special" case field types from the data, such as FlagLauncher or
   * ComponentLauncher fields.
   *
   * @param data The object tree of form values on which to perform the removal at the top level only
   * @param caseFields The list of underlying {@link CaseField} domain model objects for each field
   * @param types An array of one or more field types
   */
  public removeCaseFieldsOfType(data: object, caseFields: CaseField[], types: FieldTypeEnum[]): void {
    if (data && caseFields && caseFields.length > 0 && types.length > 0) {
      const caseFieldsToRemove = caseFields.filter(caseField => FieldsUtils.isCaseFieldOfType(caseField, types));
      for (const caseField of caseFieldsToRemove) {
        delete data[caseField.id];
      }
    }
  }

  /**
   * Re-populate the form data from the values held in the case fields. This is necessary in order to pick up, for
   * each `Flags` field, any flag details data not currently present.
   *
   * `Flags` fields may be contained in other `CaseField` instances, either as a sub-field of a Complex field, or
   * fields in a collection (or sub-fields of Complex fields in a collection). Therefore, it is necessary to
   * iterate through all `CaseField`s.
   *
   * @param data The object tree of form values on which to perform the data population
   * @param caseFields The list of underlying {@link CaseField} domain model objects for each field
   */
  public repopulateFormDataFromCaseFieldValues(data: object, caseFields: CaseField[]): void {
    if (data && caseFields && caseFields.length > 0 &&
      caseFields.findIndex(caseField => FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher'])) > -1) {
      // Ignore the FlagLauncher CaseField because it does not hold any values
      caseFields.filter(caseField => !FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher']))
        .forEach(caseField => {
          // Ensure that the data object is populated for all CaseField keys it contains, even if for a given
          // CaseField key, the data object has a falsy value (hence the use of hasOwnProperty() for the check below)
          // See https://tools.hmcts.net/jira/browse/EUI-7377
          if (data.hasOwnProperty(caseField.id) && caseField.value) {
            // Create new object for the CaseField ID within the data object, if necessary (i.e. if the current value
            // is falsy); populate from the corresponding CaseField
            if (!data[caseField.id]) {
              data[caseField.id] = {};
              Object.keys(caseField.value).forEach((key) => data[caseField.id][key] = caseField.value[key]);
            } else {
              // Copy all values from the corresponding CaseField; this ensures all nested flag data (for example, a
              // Flags field within a Complex field or a collection of Complex fields) is copied across
              Object.keys(data[caseField.id]).forEach((key) => {
                if (caseField.value.hasOwnProperty(key)) {
                  data[caseField.id][key] = caseField.value[key];
                }
              });
            }
          }
        });
    }
  }

  /**
   * Populate the linked cases from the data held in its corresponding CaseField.
   *
   * @param data The object tree of form values on which to perform the data population
   * @param caseFields The list of underlying {@link CaseField} domain model objects for each field
   */
  public populateLinkedCasesDetailsFromCaseFields(data: object, caseFields: CaseField[]): void {
    if (data && caseFields && caseFields.length > 0) {
      caseFields.filter(caseField => !FieldsUtils.isCaseFieldOfType(caseField, ['ComponentLauncher']))
        .forEach(caseField => {
          if (data.hasOwnProperty('caseLinks') && caseField.value) {
            data[caseField.id] = caseField.value;
          }
        });
    }
  }
}
