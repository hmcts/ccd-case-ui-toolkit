import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { FieldsUtils } from './fields.utils';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { Wizard, WizardPage, WizardPageField } from '../../components';
import { CaseField, FieldTypeEnum } from '../../domain/definition';
import { CaseEventTrigger } from '../../domain/case-view/case-event-trigger.model';

// @dynamic
@Injectable()
export class FieldsPurger {

  constructor(
    private fieldsUtils: FieldsUtils,
  ) {}

  clearHiddenFields(form: FormGroup, wizard: Wizard, eventTrigger: CaseEventTrigger, currentPageId: string) {
    this.clearHiddenFieldForFieldShowCondition(currentPageId, form, wizard, eventTrigger);
    this.clearHiddenFieldForPageShowCondition(form, wizard, eventTrigger);
  }

  private clearHiddenFieldForPageShowCondition(form: FormGroup, wizard: Wizard, eventTrigger: CaseEventTrigger) {
    let currentEventState = this.fieldsUtils.getCurrentEventState(eventTrigger, form);
    wizard.pages.forEach(wp => {
      if (this.hasShowConditionPage(wp, currentEventState)) {
          let condition = new ShowCondition(wp.show_condition);
          if (this.isHidden(condition, currentEventState)) {
            this.resetPage(form, wp);
          }
      }
    });
  }

  private clearHiddenFieldForFieldShowCondition(currentPageId: string, form: FormGroup, wizard: Wizard, eventTrigger: CaseEventTrigger) {
    let formFields = form.getRawValue();
    let currentPage: WizardPage = wizard.getPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(eventTrigger, form));
    currentPage.wizard_page_fields.forEach(wpf => {
      let case_field = this.findCaseFieldByWizardPageFieldId(currentPage, wpf);
      if (this.hasShowConditionField(case_field, formFields)) {
        let condition = new ShowCondition(case_field.show_condition);
        if (this.isHidden(condition, formFields.data) && !(this.isReadonly(case_field))) {
          this.resetField(form, case_field);
        }
      }
      this.retainHiddenValueByFieldType(case_field, form);
    });
  }

  private retainHiddenValueByFieldType(field, form) {
    // so far only applies to the new field type OrganisationPolicy which needs to retain the default case role value
    // for other case fields there should be no side effects
    if (field && field.field_type && field.field_type.id === 'OrganisationPolicy') {
      const caseRoleFormControl = ((form.get('data') as FormGroup).get(field.id) as FormGroup)
        .get('OrgPolicyCaseAssignedRole') as FormControl;
      caseRoleFormControl.enable();
    }
  }

  private isHidden(condition: ShowCondition, formFields: any): boolean {
    return !condition.match(formFields);
  }

  private findCaseFieldByWizardPageFieldId(currentPage: WizardPage, wizardPageField: WizardPageField): CaseField {
    return currentPage.case_fields.find(cf => cf.id === wizardPageField.case_field_id);
  }

  private hasShowConditionPage(wizardPage: WizardPage, formFields: any): boolean {
    return wizardPage.show_condition && formFields[this.getShowConditionKey(wizardPage.show_condition)];
  }

  private hasShowConditionField(case_field: CaseField, formFields: any): boolean {
    return case_field.show_condition && formFields.data[this.getShowConditionKey(case_field.show_condition)];
  }

  private getShowConditionKey(show_condition: string): string {
    // Need to allow for negated conditions, i.e. !=, as well as regular ones (=)
    return show_condition.split(/!=|=/)[0];
  }

  private resetField(form: FormGroup, field: CaseField) {
    // If the hidden field's value is to be retained, do nothing (except if it is a Complex type or collection of
    // Complex types). This is a change to the previous behaviour (which used to clear the field value but remove it
    // from submission as an update to the back-end). The new behaviour is to leave the field as is, so if the field
    // is hidden but then un-hidden before form submission, any previously entered value is retained.
    //
    // For Complex field types, an additional check of sub-fields is required. The same applies to a collection of
    // Complex types.
    if (field.retain_hidden_value) {
      const fieldType: FieldTypeEnum = field.field_type.type;
      // If the field is a Complex type, loop over its sub-fields and call deleteFieldValue() for any sub-fields
      // where retain_hidden_value is false, OR for any Complex sub-fields *regardless of retain_hidden_value* (in
      // order to inspect the sub-fields of a Complex type within another Complex type)
      if (fieldType === 'Complex' && field.field_type.complex_fields.length > 0) {
        for (const complexSubField of field.field_type.complex_fields) {
          if ((complexSubField.field_type.type === 'Complex' && complexSubField.field_type.complex_fields.length > 0) ||
              !complexSubField.retain_hidden_value) {
            // Call deleteFieldValue() with the parent FormGroup (i.e. the Complex field itself) and the sub-field to
            // be deleted
            this.deleteFieldValue(form.get('data').get(field.id) as FormGroup, complexSubField);
          }
        }
      } else if (fieldType === 'Collection' && field.field_type.collection_field_type.type === 'Complex' &&
                field.field_type.collection_field_type.complex_fields.length > 0) {
        // If the field is a collection of Complex types, loop through each one and call deleteFieldValue() for any
        // sub-fields where retain_hidden_value is false, OR for any Complex sub-fields *regardless of
        // retain_hidden_value* (in order to inspect the sub-fields of a Complex type within another Complex type)

        // Get the array of field controls corresponding to the Complex field values
        const fieldControl = form.get('data').get(field.id) as FormArray;

        // Get the array of Complex field values
        const complexFieldValues = fieldControl.value as any[];

        // For each Complex field value, get the ID of each sub-field within it and use as a key to find the
        // corresponding sub-CaseField (which contains the field type information)
        if (complexFieldValues) {
          complexFieldValues.forEach((fieldValue, index) => Object.keys(fieldValue.value).forEach(subFieldId => {
            // Find the sub-CaseField corresponding to the sub-field ID
            let subCaseField: CaseField;
            for (const caseField of field.field_type.collection_field_type.complex_fields) {
              if (caseField.id === subFieldId) {
                subCaseField = caseField;
                break;
              }
            }

            // Recursively delete the sub-field value if retain_hidden_value is false, OR if the sub-field type is
            // Complex - regardless of retain_hidden_value, passing in the parent FormGroup
            if (subCaseField &&
                ((subCaseField.field_type.type === 'Complex' && subCaseField.field_type.complex_fields.length > 0) ||
                !subCaseField.retain_hidden_value)) {
              const parentFormGroup: FormGroup = fieldControl.at(index).get('value') as FormGroup;
              this.deleteFieldValue(parentFormGroup, subCaseField);
            }
          }));
        }
      }
    } else {
      // Delete the field value
      this.deleteFieldValue(form.get('data') as FormGroup, field);
    }
  }

  private resetPage(form: FormGroup, wizardPage: WizardPage) {
    wizardPage.wizard_page_fields.forEach(wpf => {
      let case_field = this.findCaseFieldByWizardPageFieldId(wizardPage, wpf);
      this.resetField(form, case_field);
    });
  }

  private getType(elem: any): string {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }

  private isObject(elem: any): boolean {
    return this.getType(elem) === 'Object';
  };

  // TODO: call isReadOnly on CaseFields once we make it available
  private isReadonly(case_field: CaseField): boolean {
    return case_field.display_context.toUpperCase() === 'READONLY'
  }

  /**
   * Deletes a field value by setting the value of the corresponding {@link FormControl} to null (or an empty array
   * if the field type is `Collection`), except when the field type is `Complex` or `Document`. For `Complex` field
   * types, this recursive method is called until simple or "base" field types are reached. For `Document` field
   * types, its _sub-field_ `FormControl` values are set to null.
   *
   * @param formGroup The `FormGroup` instance containing the `FormControl` for the specified field
   * @param field The `CaseField` whose value is to be deleted in the backend
   */
  public deleteFieldValue(formGroup: FormGroup, field: CaseField) {
    const fieldType: FieldTypeEnum = field.field_type.type;
    const fieldControl = formGroup.get(field.id);

    if (fieldControl) {
      switch (fieldType) {
        case 'Complex':
          // If the field is a Complex type, loop over its sub-fields and call deleteFieldValue() for any sub-fields
          // where retain_hidden_value is false, OR for any Complex sub-fields *regardless of retain_hidden_value*
          // (in order to inspect the sub-fields of a Complex type within another Complex type)
          if (field.field_type.complex_fields.length > 0) {
            for (const complexSubField of field.field_type.complex_fields) {
              if ((complexSubField.field_type.type === 'Complex' && complexSubField.field_type.complex_fields.length > 0) ||
                  !complexSubField.retain_hidden_value) {
                // The fieldControl is cast to a FormGroup because a Complex field type uses this as its underlying
                // implementation
                this.deleteFieldValue(fieldControl as FormGroup, complexSubField);
              }
            }
          }
          break;
        case 'Collection':
          // If it is a collection of Complex types, loop through each one; else fall through to be handled as a
          // collection of simple types (in the same way as MultiSelectList), unless it's a collection of Document
          // types, which requires different handling
          const collectionFieldType = field.field_type.collection_field_type;
          if (collectionFieldType.type === 'Complex' && collectionFieldType.complex_fields.length > 0) {
            // Get the array of Complex field values
            const complexFieldValues = fieldControl.value as any[];

            // For each Complex field value, get the ID of each sub-field within it and use as a key to find the
            // corresponding sub-CaseField (which contains the field type information)
            if (complexFieldValues) {
              complexFieldValues.forEach((fieldValue, index) => Object.keys(fieldValue.value).forEach(subFieldId => {
                // Find the sub-CaseField corresponding to the sub-field ID
                let subCaseField: CaseField;
                for (const caseField of collectionFieldType.complex_fields) {
                  if (caseField.id === subFieldId) {
                    subCaseField = caseField;
                    break;
                  }
                }

                // Recursively delete the sub-field value, passing in the parent FormGroup
                const parentFormGroup: FormGroup = (fieldControl as FormArray).at(index).get('value') as FormGroup;
                this.deleteFieldValue(parentFormGroup, subCaseField);
              }));
            }
            break;
          } else if (collectionFieldType.type === 'Document') {
            // Get the array of Document field values
            const documentFieldValues = fieldControl.value as any[];

            // For each Document field value, set all its property values to null (this is not accepted by the
            // back-end but will be handled by sanitiseObject() in FormValueService before sending - see below for
            // the single Document case)
            if (documentFieldValues) {
              documentFieldValues.forEach((fieldValue, index) => Object.keys(fieldValue.value).forEach(subFieldId => {
                // Get the FormGroup containing the FormControl for the sub-field and set its value to null
                (fieldControl as FormArray).at(index).get(`value.${subFieldId}`).setValue(null);
              }));
            }
            break;
          }
          // Omitted "break" is intentional because a collection should be handled as per MultiSelectList if it is
          // not a collection of Complex types
          // tslint:disable-next-line: no-switch-case-fall-through
        case 'MultiSelectList':
          // Field control should be a FormArray, so map each of its values to null
          fieldControl.setValue(fieldControl.value.map(() => null));
          break;
        case 'Document':
          const documentFieldValue = fieldControl.value;
          for (const key in documentFieldValue) {
            if (fieldControl.get(key)) {
              // The back-end doesn't accept null as a valid value for any of the Document field type properties but
              // this is handled by sanitiseObject() in FormValueService, returning a null object for the entire
              // Document field, if any of its properties is null - which is accepted by the back-end
              fieldControl.get(key).setValue(null);
            }
          }
          break;
        default:
          fieldControl.setValue(null);
      }
    }
  }
}
