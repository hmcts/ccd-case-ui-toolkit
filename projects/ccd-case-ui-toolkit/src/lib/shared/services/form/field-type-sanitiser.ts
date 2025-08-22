import { Injectable } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';
import { isEqual } from 'underscore';

@Injectable()
export class FieldTypeSanitiser {
  public static readonly FIELD_TYPE_COMPLEX: FieldTypeEnum = 'Complex';
  public static readonly FIELD_TYPE_COLLECTION: FieldTypeEnum = 'Collection';
  public static readonly FIELD_TYPE_DYNAMIC_LIST: FieldTypeEnum = 'DynamicList';
  public static readonly FIELD_TYPE_DYNAMIC_RADIO_LIST: FieldTypeEnum = 'DynamicRadioList';
  public static readonly FIELD_TYPE_DYNAMIC_MULTISELECT_LIST: FieldTypeEnum = 'DynamicMultiSelectList';
  public static readonly DYNAMIC_LIST_TYPE: FieldTypeEnum[] = ['DynamicList', 'DynamicRadioList', 'DynamicMultiSelectList'];
  public static readonly DATE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;  
  /**
   * This method finds dynamiclists in a form and replaces their string
   * values, with a JSON object, as below:
   * From: 'xyz'
   * To  : {
   *   value: { code:'xyz', label:'XYZ' },
   *   list_items: [
   *     { code:'xyz', label:'XYZ'},
   *     { code:'abc', label:'ABC'}
   *   ]
   * }
   * @param caseFields The CaseFields to assess.
   * @param data The data in the form.
   */
  public sanitiseLists(caseFields: CaseField[], data: any) {
    if (!data || !caseFields) {
      return;
    }
    caseFields = this.ensureDynamicMultiSelectListPopulated(caseFields);
    caseFields.forEach((caseField) => {
      // tslint:disable-next-line:switch-default
      switch (caseField.field_type.type) {
        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_MULTISELECT_LIST:
          this.convertArrayToDynamicListOutput(caseField, data);
          break;
        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_RADIO_LIST:
        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_LIST:
          this.convertStringToDynamicListOutput(caseField, data);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COMPLEX:
          this.sanitiseLists(caseField.field_type.complex_fields, data[caseField.id]);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COLLECTION:
          this.synchronizeCasefieldWithData(caseField, data);
          if (Array.isArray(data[caseField.id])) {
            data[caseField.id].forEach((formElement: any) => {
              this.sanitiseLists(caseField.field_type.collection_field_type.complex_fields, formElement.value);
            });
          }
          break;
      }
    });
  }

  public synchronizeCasefieldWithData(caseField: CaseField, data: any): void {
    for (const field in caseField._value) {
      for (const id in data[caseField.id]) {
        if (caseField._value[field]?.id === data[caseField.id][id]?.id) {
          this.updateFieldValues(caseField._value[field].value, data[caseField.id][id]?.value);
        }
      }
    }
  }

  public updateFieldValues(caseFieldValue: any, dataValue: any): void {
    for (const key in dataValue) {
      if ((typeof caseFieldValue[key] === 'object')){
        if (!isEqual(caseFieldValue[key], dataValue[key])) {
          this.updateObjectValue(caseFieldValue[key], dataValue[key]);
        }
      } else {
        this.updatePrimitiveValue(caseFieldValue, key, dataValue[key]);
      }
    }
  }

  public updateObjectValue(formattedObject: any, dataObject: any): void {
    // we only want to update the value if there is a list_items property
    if ((formattedObject?.value !== dataObject) && (formattedObject.list_items)) {
      formattedObject.value = dataObject;
    }
  }

  public updatePrimitiveValue(caseFieldValue: any, key: string, dataValue: any): void {
    if ((!caseFieldValue[key]) || (caseFieldValue[key] !== dataValue)) {
      caseFieldValue[key] = dataValue;
    }
  }

  public ensureDynamicMultiSelectListPopulated(caseFields: CaseField[]): CaseField[] {
    return caseFields.map((field) => {
      if (field.field_type.type !== 'Complex') {
        return field;
      }
      const caseFieldData = field._value;
      // Process each complex field
      field.field_type.complex_fields.forEach((complexField) => {
        if (complexField.field_type.type === FieldTypeSanitiser.FIELD_TYPE_COMPLEX) {
          this.checkNestedDynamicList(complexField, caseFieldData?.[complexField.id]);
        } else if (this.isDynamicList(complexField.field_type.type) &&
          complexField.display_context !== 'HIDDEN' &&
          field._value?.[complexField.id]
        ) {
          complexField.list_items = field._value[complexField.id]?.list_items;
        }
      });
      // Final transformation: construct updated field object
      return { ...field, field_type: { ...field?.field_type } } as CaseField;
    });
  }

  private checkNestedDynamicList(caseField: CaseField, fieldData: any = null): void {
    caseField.field_type.complex_fields.forEach((complexField) => {
      if (complexField.field_type.type === FieldTypeSanitiser.FIELD_TYPE_COMPLEX) {
        this.checkNestedDynamicList(complexField, fieldData?.[complexField.id]);
      } else if (this.isDynamicList(complexField.field_type.type) &&
        complexField.display_context !== 'HIDDEN' &&
        fieldData?.[complexField.id]
      ) {
        complexField.list_items = fieldData?.[complexField.id]?.list_items;
      }
    });
  }

  private isDynamicList(fieldType: FieldTypeEnum): boolean {
    return FieldTypeSanitiser.DYNAMIC_LIST_TYPE.indexOf(fieldType) !== -1;
  }

  private convertArrayToDynamicListOutput(field: CaseField, data: any): void {
    const values = data[field.id];
    if (Array.isArray(values)) {
      const listItems = this.getListItems(field);
      const matches = listItems.filter((item) => values.map((v) => v.code).indexOf(item.code) !== -1);

      data[field.id] = {
        value: matches,
        list_items: listItems
      };
    }
  }

  private convertStringToDynamicListOutput(field: CaseField, data: any): void {
    const stringValue = data[field.id];
    if (typeof stringValue === 'string') {
      const listItems = this.getListItems(field);
      const matches = listItems.filter((value) => value?.code === stringValue);
      if (matches && matches.length > 0) {
        data[field.id] = {
          value: matches[0],
          list_items: listItems
        };
      }
    }
  }

  private getListItems(field: CaseField): any[] {
    if (field) {
      if (field.list_items) {
        return field.list_items;
      }
      if (field.formatted_value && field.formatted_value.list_items) {
        return field.formatted_value.list_items;
      }
    }
    return [];
  }
}
