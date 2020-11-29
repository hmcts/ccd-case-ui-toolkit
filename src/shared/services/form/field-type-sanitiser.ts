import { CaseField } from '../../domain/definition';
import { Injectable } from '@angular/core';

@Injectable()
export class FieldTypeSanitiser {

  /**
   * This method finds dynamiclists in a form and replaces its string value, with
   * following example JSON format
   * @return {value: {code:'xyz',label:'XYZ'}, list_items: [{code:'xyz',label:'XYZ'},{code:'abc',label:'ABC'}]}
   * @param caseFields
   * @param editForm
   */
   sanitiseLists(caseFields: CaseField[], editForm: any) {

    caseFields.forEach(caseField => {
      if (caseField.field_type.type === 'DynamicList') {
        this.getListOfKeysFromEditForm(editForm).forEach((key) => {
          this.createValueCodePairAlongWithListIfKeyExistsInForm(caseField, key, editForm);
        });
      } else if (caseField.field_type.type === 'Complex') {
        this.sanitiseLists(caseField.field_type.complex_fields, editForm[caseField.id]);
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
