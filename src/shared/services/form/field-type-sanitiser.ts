import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';

@Injectable()
export class FieldTypeSanitiser {

  /**
   * This method finds dynamiclists in a form and replaces its string value, with
   * following example JSON format:
   *  {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
   sanitiseDynamicLists(caseFields: CaseField[], editForm: any) {
    this.getDynamicListsFromCaseFields(caseFields).forEach(dynamicField => {
      this.getListOfKeysFromEditForm(editForm).forEach((key) => {
        this.sanitizeDynamicList(dynamicField, key, editForm);
      });
    });
  }

  private sanitizeDynamicList(dynamicField: CaseField, key, editForm: any) {
    if (dynamicField.id === key) {
      editForm['data'][key] = {
          value: this.getMatchingCodeFromListOfItems(dynamicField, editForm, key),
          list_items: dynamicField.list_items
        };
    }
  }

  private getMatchingCodeFromListOfItems(dynamicField: CaseField, editForm: any, key) {
    let result = dynamicField.list_items.filter(value => value.code === editForm['data'][key]);
    return result.length > 0 ? result[0] : {};
  }

  private getListOfKeysFromEditForm(editForm: any) {
    return Object.keys(editForm['data']);
  }

  private getDynamicListsFromCaseFields(caseFields: CaseField[]): CaseField[] {
    return caseFields
      .filter(caseField => caseField.field_type.type === 'DynamicList');
  }
}
