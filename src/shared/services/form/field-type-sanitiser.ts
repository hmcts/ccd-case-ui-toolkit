import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';

// @dynamic
@Injectable()
export class FieldTypeSanitiser {

  /**
   * This method takes finds dynamiclists in a form and replaces its string value, with
   * following example JSON format
   * @return {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
  public static sanitiseLists(caseFields: CaseField[], editForm: any) {

    this.getDynamicListsFromCaseFields(caseFields).forEach(dynamicField => {
      this.getListOfKeysFromEditForm(editForm).forEach((key) => {
        this.createValueCodePairAlongWithListIfKeyExistsInForm(dynamicField, key, editForm);
      });
    });
  }

  private static createValueCodePairAlongWithListIfKeyExistsInForm(dynamicField, key, editForm: any) {
    if (dynamicField.id === key) {
      editForm['data'][key] =
        {
          value: this.getMatchingCodeFromListOfItems(dynamicField, editForm, key),
          list_items: dynamicField.items
        };
    }
  }

  private static getMatchingCodeFromListOfItems(dynamicField, editForm: any, key) {
    let result = dynamicField.items.filter(value => value.code === editForm['data'][key]);
    return result.length > 0? result[0] : {};
  }

  private static getListOfKeysFromEditForm(editForm: any) {
    return Object.keys(editForm['data']);
  }

  private static getDynamicListsFromCaseFields(caseFields: CaseField[]): CaseField[] {
    return caseFields
      .filter(caseField => caseField.field_type.type === 'DynamicList');
  }
}
