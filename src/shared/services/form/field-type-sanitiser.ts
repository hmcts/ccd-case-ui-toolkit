import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FieldTypeSanitiser {
  public static readonly FIELD_TYPE_COMPLEX: FieldTypeEnum = 'Complex';
  public static readonly FIELD_TYPE_COLLECTION: FieldTypeEnum = 'Collection';
  public static readonly FIELD_TYPE_DYNAMIC_LIST: FieldTypeEnum = 'DynamicList';
  public static readonly FIELD_TYPE_DYNAMIC_MULTISELECT_LIST: FieldTypeEnum = 'DynamicMultiSelectList';
  

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
    caseFields.forEach(caseField => {

      switch (caseField.field_type.type) {
        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_MULTISELECT_LIST:
          this.convertArrayToDynamicListOutput(caseField, data);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_LIST:
          this.convertStringToDynamicListOutput(caseField, data);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COMPLEX:
          this.sanitiseLists(caseField.field_type.complex_fields, data[caseField.id]);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COLLECTION:
          if (Array.isArray(data[caseField.id])) {
            data[caseField.id].forEach((formElement: any) => {
              this.sanitiseLists(caseField.field_type.collection_field_type.complex_fields, formElement.value);
            });
          }
          break;
      }

    });
  }

  private convertArrayToDynamicListOutput(field: CaseField, data: any): void {
    const values = data[field.id];

    if (Array.isArray(values)) {
      const listItems = this.getListItems(field);
      const matches = listItems.filter(item => values.map(v => v.code).indexOf(item.code) !== -1);

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
      const matches = listItems.filter(value => value.code === stringValue);
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
