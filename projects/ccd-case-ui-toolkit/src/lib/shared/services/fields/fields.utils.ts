import { CurrencyPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { plainToClassFromExist } from 'class-transformer';
import { WizardPage } from '../../components/case-editor/domain';
import { AbstractFormFieldComponent } from '../../components/palette/base-field/abstract-form-field.component';
import { FlagDetail, FlagsWithFormGroupPath } from '../../components/palette/case-flag/domain/case-flag.model';
import { CaseFlagStatus } from '../../components/palette/case-flag/enums/case-flag-status.enum';
import { DatePipe } from '../../components/palette/utils';
import { CaseEventTrigger, CaseField, CaseTab, CaseView, FieldType, FieldTypeEnum, FixedListItem, Predicate } from '../../domain';
import { FormatTranslatorService } from '../case-fields/format-translator.service';

// @dynamic
@Injectable()
export class FieldsUtils {
  private static readonly caseLevelCaseFlagsFieldId = 'caseFlags';
  private static readonly currencyPipe: CurrencyPipe = new CurrencyPipe('en-GB');
  private static readonly datePipe: DatePipe = new DatePipe(new FormatTranslatorService());
  // EUI-4244. 3 dashes instead of 1 to make this less likely to clash with a real field.
  public static readonly LABEL_SUFFIX = '---LABEL';
  // Handling of Dynamic Lists in Complex Types
  public static readonly SERVER_RESPONSE_FIELD_TYPE_COLLECTION = 'Collection';
  public static readonly SERVER_RESPONSE_FIELD_TYPE_COMPLEX = 'Complex';
  public static readonly SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST_TYPE: FieldTypeEnum[] = ['DynamicList', 'DynamicRadioList'];

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

  // public static getType(elem: any): string {
  //   return Object.prototype.toString.call(elem).slice(8, -1);
  // }

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
    // tslint:disable-next-line: triple-equals
    const hasNonNullPrimitive = values.some(x => (x != null &&
      ((typeof x === 'object' && x.constructor === Object) || Array.isArray(x)
        ? !objectRefs.push(x)
        : typeof x === 'number' || x.length > 0)
    ));
    return !hasNonNullPrimitive ? objectRefs.some(y => this.containsNonEmptyValues(y)) : hasNonNullPrimitive;
  }

  /**
   * handleNestedDynamicLists()
   * Reassigns list_item and value data to DynamicList children
   * down the tree. Server response returns data only in
   * the `value` object of parent complex type
   *
   * EUI-2530 Dynamic Lists for Elements in a Complex Type
   *
   * @param jsonBody - { case_fields: [ CaseField, CaseField ] }
   */
  public static handleNestedDynamicLists(jsonBody: { case_fields: CaseField[] }): any {
    if (jsonBody.case_fields) {
      jsonBody.case_fields.forEach(caseField => {
        if (caseField.field_type) {
          this.setDynamicListDefinition(caseField, caseField.field_type, caseField);
        }
      });
    }

    return jsonBody;
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

  private static readonly DEFAULT_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: object): void {
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }
  };

  private static readonly LABEL_MERGE_FUNCTION = function mergeFunction(field: CaseField, result: object): void {
    if (!result) {
      result = {};
    }
    if (!result.hasOwnProperty(field.id)) {
      result[field.id] = field.value;
    }

    // tslint:disable-next-line: switch-default
    switch (field.field_type.type) {
      case 'FixedList':
      case 'FixedRadioList': {
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
        const fieldValue = (result[field.id] || field.value);
        result[field.id] = FieldsUtils.getMoneyGBP(fieldValue);
        break;
      }
      case 'Date': {
        const fieldValue = (result[field.id] || field.value);
        result[field.id] = FieldsUtils.getDate(fieldValue);
        break;
      }
      case 'Complex': {
        if (result[field.id] && field.field_type.complex_fields) {
          field.field_type.complex_fields.forEach((f: CaseField) => {
            if (['Collection', 'Complex', 'MultiSelectList'].indexOf(f.field_type.type) > -1) {
              FieldsUtils.LABEL_MERGE_FUNCTION(f, result[field.id]);
            }
          });
        }
        break;
      }
      case 'Collection': {
        const elements = (result[field.id] || field.value);
        if (elements) {
          elements.forEach((elem: any) => {
            // tslint:disable-next-line:switch-default
            switch (field.field_type.collection_field_type.type) {
              case 'MoneyGBP': {
                elem.value = FieldsUtils.getMoneyGBP(elem.value);
                break;
              }
              case 'Date': {
                elem.value = FieldsUtils.getDate(elem.value);
                break;
              }
              case 'Complex': {
                if (field.field_type.collection_field_type.complex_fields) {
                  field.field_type.collection_field_type.complex_fields.forEach((f: CaseField) => {
                    if (['Collection', 'Complex', 'MultiSelectList'].indexOf(f.field_type.type) > -1) {
                      FieldsUtils.LABEL_MERGE_FUNCTION(f, elem.value);
                    }
                  });
                }
                break;
              }
            }
          });
        }
        break;
      }
    }
  };

  /**
   * Formats a `MoneyGBP` value to include currency units.
   * @param fieldValue The CurrencyPipe expects an `any` parameter so this must also be `any`,
   * but it should be "number-like" (e.g., '1234')
   * @returns A formatted string (e.g., £12.34)
   */
  private static getMoneyGBP(fieldValue: any): string {
    return fieldValue ? FieldsUtils.currencyPipe.transform(fieldValue / 100, 'GBP', 'symbol') : fieldValue;
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

  private static setDynamicListDefinition(caseField: CaseField, caseFieldType: FieldType, rootCaseField: CaseField) {
    if (caseFieldType.type === FieldsUtils.SERVER_RESPONSE_FIELD_TYPE_COMPLEX) {

      caseFieldType.complex_fields.forEach(field => {
        try {
          const isDynamicField = FieldsUtils.SERVER_RESPONSE_FIELD_TYPE_DYNAMIC_LIST_TYPE.indexOf(field.field_type.type) !== -1;

          if (isDynamicField) {
            const dynamicListValue = this.getDynamicListValue(rootCaseField.value, field.id);
            if (dynamicListValue) {
              const list_items = dynamicListValue[0].list_items;
              const complexValue = dynamicListValue.map(data => data.value);
              const value = {
                list_items,
                value: complexValue.length > 0 ? complexValue : undefined
              };
              field.value = {
                ...value
              };
              field.formatted_value = {
                ...field.formatted_value,
                ...value
              };
            }
          } else {
            this.setDynamicListDefinition(field, field.field_type, rootCaseField);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } else if (caseFieldType.type === FieldsUtils.SERVER_RESPONSE_FIELD_TYPE_COLLECTION) {
      if (caseFieldType.collection_field_type) {
        this.setDynamicListDefinition(caseField, caseFieldType.collection_field_type, rootCaseField);
      }
    }
  }

  private static getDynamicListValue(jsonBlock: any, key: string) {
    const data = jsonBlock ? this.getNestedFieldValues(jsonBlock, key, []) : [];

    return data.length > 0 ? data : null;
  }

  private static getNestedFieldValues(jsonData: any, key: string, output: any[] = []) {
    if (jsonData && jsonData[key]) {
      output.push(jsonData[key]);
    } else  {
      for (const elementKey in jsonData) {
        if (typeof jsonData === 'object' && jsonData.hasOwnProperty(elementKey)) {
          this.getNestedFieldValues(jsonData[elementKey], key, output);
        }
      }
    }
    return output;
  }

  public static isFlagsCaseField(caseField: CaseField): boolean {
    if (!caseField) {
      return false;
    }

    return this.isFlagsFieldType(caseField.field_type);
  }

  public static isFlagLauncherCaseField(caseField: CaseField): boolean {
    if (!caseField) {
      return false;
    }

    return caseField.field_type.type === 'FlagLauncher';
  }

  public static getValidationErrorMessageForFlagLauncherCaseField(caseField: CaseField): string {
    switch(caseField.display_context_parameter) {
      case '#ARGUMENT(CREATE)':
        return 'Please select Next to complete the creation of the case flag';
      case '#ARGUMENT(CREATE,EXTERNAL)':
        return 'Please select Next to complete the creation of the support request';
      case '#ARGUMENT(UPDATE)':
        return 'Please select Next to complete the update of the selected case flag';
      case '#ARGUMENT(UPDATE,EXTERNAL)':
        return 'Please select Next to complete the update of the selected support request';
      default:
        return '';
    }
  }

	public static isComponentLauncherCaseField(caseField: CaseField): boolean {
    if (!caseField) {
      return false;
    }

    return caseField.field_type.type === 'ComponentLauncher';
  }

  public static isLinkedCasesCaseField(caseField: CaseField): boolean {
    return FieldsUtils.isComponentLauncherCaseField(caseField) &&
      caseField.id === 'LinkedCasesComponentLauncher';
  }

  public static containsLinkedCasesCaseField(caseFields: CaseField[]): boolean {
    return caseFields?.some(caseField => FieldsUtils.isLinkedCasesCaseField(caseField));
  }

  public static isFlagsFieldType(fieldType: FieldType): boolean {
    if (!fieldType) {
      return false;
    }

    // Note: This implementation supports the dummy field type ID of "CaseFlag" for testing and the real field type
    // ID of "Flags"
    return (fieldType.type === 'Complex' && (fieldType.id === 'CaseFlag' || fieldType.id === 'Flags'));
  }

  /**
   * Extract flags data from a `CaseField` instance, recursing and iterating through sub-fields of a Complex field or
   * each field in a Collection field.
   *
   * @param flags An array for accumulating extracted flags data and derived `FormGroup` paths
   * @param caseField A `CaseField` instance from which to extract the flags data
   * @param pathToFlagsFormGroup A (dot-delimited) string for concatenating the name of each control that forms the path
   * to the `FormGroup` for the `Flags` instance
   * @param topLevelCaseField The top-level `CaseField` that contains the value property. This is required because _only
   * top-level_ `CaseField`s contain actual values and a reference needs to be maintained to such a field
   * @param currentValue The current value object of a `CaseField` that is a sub-field of a non root-level Complex field.
   * Required for mapping the `CaseField` value to a `Flags` object if it is a "Flags" `CaseField`. (For Complex types,
   * only the _root-level_ `CaseField` contains a value property - all sub-fields, including any nested Complex fields,
   * do *not* contain any values themselves.)
   * @returns An array of `FlagsWithFormGroupPath`, each instance comprising a `Flags` object derived from a `CaseField`
   * of type "Flags", and the dot-delimited path string to the corresponding `FormGroup`
   */
  public static extractFlagsDataFromCaseField(flags: FlagsWithFormGroupPath[], caseField: CaseField,
    pathToFlagsFormGroup: string, topLevelCaseField: CaseField, currentValue?: object): FlagsWithFormGroupPath[] {
      const fieldType = caseField.field_type;
      switch (fieldType.type) {
        case 'Complex':
          // If the field is a Flags CaseField (these are implemented as Complex types), it can be mapped to a Flags
          // object immediately
          if (FieldsUtils.isFlagsCaseField(caseField)) {
            // If the Flags CaseField has a value, it is a root-level Complex field; if it does not, it is a Flags
            // CaseField that is a sub-field within another Complex field, so use the currentValue value (if any)
            // instead. The exception to this is the "caseFlags" Flags CaseField, which will have an empty object value
            // initially, because no party name is required
            if (caseField.value && FieldsUtils.isNonEmptyObject(caseField.value) ||
              caseField.id === this.caseLevelCaseFlagsFieldId) {
              flags.push(this.mapCaseFieldToFlagsWithFormGroupPathObject(caseField, pathToFlagsFormGroup));
            } else if (currentValue && FieldsUtils.isNonEmptyObject(currentValue)) {
              pathToFlagsFormGroup += `.${caseField.id}`;
              flags.push(this.mapValueToFlagsWithFormGroupPathObject(
                caseField.id, currentValue, pathToFlagsFormGroup, topLevelCaseField));
            }
          } else if (fieldType.complex_fields) {
            const value = caseField.value ? caseField.value : currentValue;
            if (value && FieldsUtils.isNonEmptyObject(value)) {
              flags = fieldType.complex_fields.reduce((flagsOfComplexField, subField) => {
                return this.extractFlagsDataFromCaseField(
                  flagsOfComplexField, subField, pathToFlagsFormGroup, topLevelCaseField, value[subField.id]);
              }, flags);
            }
          }
          break;
        // For a Collection field, the values are stored directly as key-value pairs in the CaseField's value property
        // as an array, unless the collection is a sub-field of a Complex type - sub-fields never contain values
        case 'Collection':
          // If this is a collection of Flags CaseFields, these can be mapped to Flags objects immediately
          if (FieldsUtils.isFlagsFieldType(fieldType.collection_field_type)) {
            // If the Collection CaseField has a value (an array), it is a root-level Collection field; if it does not,
            // it is a Collection CaseField that is a sub-field within a Complex field, so use the currentValue value
            // (if any) instead
            const pathFragment = pathToFlagsFormGroup += '.index.value';
            if (caseField.value) {
              caseField.value.forEach((item: { id: string; value: object; }, index: number) => {
                // At each iteration, replace the "index" placeholder with the actual index
                pathToFlagsFormGroup = pathFragment.replace('index', index.toString(10));
                flags.push(
                  this.mapValueToFlagsWithFormGroupPathObject(item.id, item.value, pathToFlagsFormGroup, caseField));
              });
            } else if (currentValue) {
              (currentValue as []).forEach((item: { id: string; value: object; }, index: number) => {
                pathToFlagsFormGroup = pathFragment.replace('index', index.toString(10));
                flags.push(
                  this.mapValueToFlagsWithFormGroupPathObject(item.id, item.value, pathToFlagsFormGroup, topLevelCaseField));
              });
            }
          } else if (fieldType.collection_field_type.type === 'Complex' && fieldType.collection_field_type.complex_fields) {
            if (caseField.value) {
              // Perform a reduction over each Complex field's sub-fields (similar to what is done above for non-Flags
              // Complex fields)
              // (Cannot just call this function recursively for each Complex field in the collection because the CaseField
              // for each one is not part of the collection)
              const pathFragment = pathToFlagsFormGroup += '.index.value';
              caseField.value.forEach((item: { id: string; value: object; }, index: number) => {
                // At each iteration, replace the "index" placeholder with the actual index
                pathToFlagsFormGroup = pathFragment.replace('index', index.toString(10));
                flags = fieldType.collection_field_type.complex_fields.reduce((flagsOfComplexField, subField) => {
                  return this.extractFlagsDataFromCaseField(
                    flagsOfComplexField, subField, pathToFlagsFormGroup, topLevelCaseField, item.value[subField.id]);
                }, flags);
              });
            }
          }
          break;
        default:
          // Ignore all other field types
      }
      return flags;
  }

  private static mapCaseFieldToFlagsWithFormGroupPathObject(caseField: CaseField,
    pathToFlagsFormGroup: string): FlagsWithFormGroupPath {
      return this.mapValueToFlagsWithFormGroupPathObject(caseField.id, caseField.value, pathToFlagsFormGroup, caseField);
  }

  private static mapValueToFlagsWithFormGroupPathObject(id: string, value: object,
    pathToFlagsFormGroup: string, caseField: CaseField): FlagsWithFormGroupPath {
      return {
        flags: {
          flagsCaseFieldId: id,
          partyName: value ? value['partyName'] : null,
          roleOnCase: value ? value['roleOnCase'] : null,
          details: value && value['details'] && value['details'].length > 0
            ? (value['details'] as any[]).map(detail => {
              return Object.assign({}, ...Object.keys(detail.value).map(k => {
                // The id property set below will be null for a new case flag, and a unique id returned from CCD when
                // updating an existing flag
                switch (k) {
                  // These two fields are date-time fields
                  case 'dateTimeModified':
                  case 'dateTimeCreated':
                    return {[k]: detail.value[k] ? new Date(detail.value[k]) : null, id: detail.id};
                  // This field is a "yes/no" field
                  case 'hearingRelevant':
                    return detail.value[k].toUpperCase() === 'YES' ? {[k]: true, id: detail.id} : {[k]: false, id: detail.id};
                  default:
                    return {[k]: detail.value[k], id: detail.id};
                }
              }));
            }) as FlagDetail[]
            : null
        },
        pathToFlagsFormGroup,
        caseField
      };
  }

  /**
   * Count active flags in a `CaseField` instance, recursing and iterating through sub-fields of a Complex field or each
   * field in a Collection field.
   *
   * @param activeCount An accumulation of the total number of active flags
   * @param caseField A `CaseField` instance for which to count the active flags
   * @param currentValue The current value object of a `CaseField` that is a sub-field of a non root-level Complex field.
   * (For Complex types, only the _root-level_ `CaseField` contains a value property - all sub-fields, including any
   * nested Complex fields, do *not* contain any values themselves.)
   * @returns The count of active flags
   */
  public static countActiveFlagsInCaseField(activeCount: number, caseField: CaseField, currentValue?: object): number {
      const fieldType = caseField.field_type;
      switch (fieldType.type) {
        case 'Complex':
          if (FieldsUtils.isFlagsCaseField(caseField)) {
            // If the Flags CaseField has a value, it is a root-level Complex field; if it does not, it is a Flags
            // CaseField that is a sub-field within another Complex field, so use the currentValue value (if any) instead
            const value = caseField.value ? caseField.value : currentValue;
            if (value && FieldsUtils.isNonEmptyObject(value) && value.details) {
              activeCount = value.details.reduce(
                (count, detail) => detail.value.status === CaseFlagStatus.ACTIVE ? count + 1 : count,
                activeCount
              );
            }
          } else if (fieldType.complex_fields) {
            const value = caseField.value ? caseField.value : currentValue;
            if (value && FieldsUtils.isNonEmptyObject(value)) {
              activeCount = fieldType.complex_fields.reduce((activeFlagsCountOfComplexField, subField) => {
                return this.countActiveFlagsInCaseField(
                  activeFlagsCountOfComplexField,
                  subField,
                  value[subField.id]
                );
              }, activeCount);
            }
          }
          break;
        // For a Collection field, the values are stored directly as key-value pairs in the CaseField's value property
        // as an array, unless the collection is a sub-field of a Complex type - sub-fields never contain values
        case 'Collection':
          if (FieldsUtils.isFlagsFieldType(fieldType.collection_field_type)) {
            // If the Collection CaseField has a value (an array), it is a root-level Collection field; if it does not,
            // it is a Collection CaseField that is a sub-field within a Complex field, so use the currentValue value
            // (if any) instead
            const value = caseField.value ? caseField.value : currentValue;
            if (value) {
              value.forEach((item: { id: string; value: object; }) => {
                if (item.value['details']) {
                  activeCount = item.value['details'].reduce(
                    (count, detail) => detail.value.status === CaseFlagStatus.ACTIVE ? count + 1 : count,
                    activeCount
                  );
                }
              });
            }
          } else if (fieldType.collection_field_type.type === 'Complex' && fieldType.collection_field_type.complex_fields) {
            if (caseField.value) {
              // Perform a reduction over each Complex field's sub-fields (similar to what is done above for non-Flags
              // Complex fields)
              // (Cannot just call this function recursively for each Complex field in the collection because the CaseField
              // for each one is not part of the collection)
              caseField.value.forEach((item: { id: string; value: object; }) => {
                activeCount = fieldType.collection_field_type.complex_fields.reduce(
                  (activeFlagsCountOfComplexField, subField) => {
                    return this.countActiveFlagsInCaseField(activeFlagsCountOfComplexField, subField, item.value[subField.id]);
                  },
                  activeCount
                );
              });
            }
          }
          break;
        default:
          // Ignore all other field types
      }
      return activeCount;
  }

  public buildCanShowPredicate(eventTrigger: CaseEventTrigger, form: any): Predicate<WizardPage> {
    const currentState = this.getCurrentEventState(eventTrigger, form);
    return (page: WizardPage): boolean => {
      return page.parsedShowCondition.match(currentState);
    };
  }

  public getCurrentEventState(eventTrigger: { case_fields: CaseField[] }, form: FormGroup): object {
    return this.mergeCaseFieldsAndFormFields(eventTrigger.case_fields, form.controls['data'].value);
  }

  public cloneCaseField(obj: any): CaseField {
    return Object.assign(new CaseField(), obj);
  }

  public mergeCaseFieldsAndFormFields(caseFields: CaseField[], formFields: object): object {
    return this.mergeFields(caseFields, formFields, FieldsUtils.DEFAULT_MERGE_FUNCTION);
  }

  public mergeLabelCaseFieldsAndFormFields(caseFields: CaseField[], formFields: object): object {
    return this.mergeFields(caseFields, formFields, FieldsUtils.LABEL_MERGE_FUNCTION);
  }

  public controlIterator(
    aControl: AbstractControl,
    formArrayFn: (array: FormArray) => void,
    formGroupFn: (group: FormGroup) => void,
    controlFn: (control: FormControl) => void
  ): void {
    if (aControl instanceof FormArray) { // We're in a collection
      formArrayFn(aControl);
    } else if (aControl instanceof FormGroup) { // We're in a complex type.
      formGroupFn(aControl);
    } else if (aControl instanceof FormControl) { // FormControl
      controlFn(aControl);
    }
  }

  private mergeFields(caseFields: CaseField[], formFields: object, mergeFunction: (field: CaseField, result: object) => void): object {
    const result: object = FieldsUtils.cloneObject(formFields);
    caseFields.forEach(field => {
      mergeFunction(field, result);
      if (field.field_type && field.field_type.complex_fields && field.field_type.complex_fields.length > 0) {
        result[field.id] = this.mergeFields(field.field_type.complex_fields, result[field.id], mergeFunction);
      }
    });
    return result;
  }
}
