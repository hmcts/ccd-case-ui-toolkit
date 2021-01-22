import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';

@Injectable()
export class FieldTypeSanitiser {
  public static readonly FIELD_TYPE_COMPLEX: FieldTypeEnum = 'Complex';
  public static readonly FIELD_TYPE_COLLECTION: FieldTypeEnum = 'Collection';
  public static readonly FIELD_TYPE_DYNAMIC_LIST: FieldTypeEnum = 'DynamicList';

  /**
   * This method finds dynamiclists in a form and replaces its string value, with
   * following example JSON format
   * @return {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
   sanitiseLists(caseFields: CaseField[], editForm: any) {

    caseFields.forEach(caseField => {

      switch (caseField.field_type.type) {
        case FieldTypeSanitiser.FIELD_TYPE_DYNAMIC_LIST:
          this.getListOfKeysFromEditForm(editForm).forEach((key) => {
            this.createValueCodePairAlongWithListIfKeyExistsInForm(caseField, key, editForm);
          });
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COMPLEX:
          this.sanitiseLists(caseField.field_type.complex_fields, editForm[caseField.id]);
          break;

        case FieldTypeSanitiser.FIELD_TYPE_COLLECTION:
          editForm[caseField.id].forEach(formElement => {
            this.sanitiseLists(caseField.field_type.collection_field_type.complex_fields, formElement.value);
          });
          break;

        default:
          break;
      }

    });
  }

  private createValueCodePairAlongWithListIfKeyExistsInForm(dynamicField: CaseField, key, editForm: any) {
    if (dynamicField.id === key) {
      editForm[key] = {
          value: this.getMatchingCodeFromListOfItems(dynamicField, editForm, key),
          list_items: dynamicField.list_items
        };
    }
  }

  private getMatchingCodeFromListOfItems(dynamicField: CaseField, editForm: any, key) {
    let result = dynamicField.list_items.filter(value => value.code === editForm[key]);
    return result.length > 0 ? result[0] : {};
  }

  private getListOfKeysFromEditForm(editForm: any) {
    return Object.keys(editForm);
  }

}
