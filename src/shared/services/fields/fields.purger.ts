import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldsUtils } from './fields.utils';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { Wizard, WizardPage, WizardPageField } from '../../components';
import { CaseField } from '../../domain/definition';
import { CaseEventTrigger } from '../../domain';

// @dynamic
@Injectable()
export class FieldsPurger {

  constructor(
    private fieldsUtils: FieldsUtils,
  ) {}

  clearHiddenFields(form: any, wizard: Wizard, eventTrigger: CaseEventTrigger, currentPageId: string): void {
    this.clearHiddenFieldForFieldShowCondition(currentPageId, form, wizard, eventTrigger);
    this.clearHiddenFieldForPageShowCondition(form, wizard, eventTrigger);
  }

  private clearHiddenFieldForPageShowCondition(form, wizard, eventTrigger) {
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

  private clearHiddenFieldForFieldShowCondition(currentPageId: string, form: any, wizard: Wizard, eventTrigger: CaseEventTrigger): void {
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

  private retainHiddenValueByFieldType(field: CaseField, form: any): void {
    // so far only applies to the new field type OrganisationPolicy which needs to retain the default case role value
    // for other case fields there should be no side effects
    if (field && field.field_type && field.field_type.id === 'OrganisationPolicy') {
      // <bubble_wrap>
      // Doing some null checking to stop it from falling over.
      const data: FormGroup = form.get('data') as FormGroup;
      if (data) {
        const fieldGroup: FormGroup = data.get(field.id) as FormGroup;
        if (fieldGroup) {
          const caseRoleFormControl: FormControl = fieldGroup.get('OrgPolicyCaseAssignedRole') as FormControl;
          if (caseRoleFormControl) {
            caseRoleFormControl.enable();
          }
        }
      }
      // </bubble_wrap>
    }
  }

  private isHidden(condition, formFields) {
    return !condition.match(formFields);
  }

  private findCaseFieldByWizardPageFieldId(currentPage: WizardPage, wizardPageField: WizardPageField) {
    return currentPage.case_fields.find(cf => cf.id === wizardPageField.case_field_id);
  }

  private hasShowConditionPage(wizardPage, formFields): boolean {
    return wizardPage.show_condition && formFields[this.getShowConditionKey(wizardPage.show_condition)];
  }

  private hasShowConditionField(case_field, formFields): boolean {
    return case_field.show_condition && formFields.data[this.getShowConditionKey(case_field.show_condition)];
  }

  private getShowConditionKey(show_condition): string {
    return show_condition.split('=')[0];
  }

  private resetField(form: any, field: CaseField): void {
    if (Array.isArray(field.value)) {
      field.value.splice(0, field.value.length);
    } else if (this.isObject(field.value)) {
      if (field.formatted_value) {
        field.value = field.formatted_value;
      } else {
        field.value = {};
      }
    } else {
      field.value = '';
    }
    (form.get('data') as FormGroup).removeControl(field.id);
  }

  private resetPage(form, wizardPage: WizardPage) {
    wizardPage.wizard_page_fields.forEach(wpf => {
      let case_field = this.findCaseFieldByWizardPageFieldId(wizardPage, wpf);
      this.resetField(form, case_field);
    });
  }

  private getType(elem): string {
    return Object.prototype.toString.call(elem).slice(8, -1);
  }

  private isObject(elem) {
    return this.getType(elem) === 'Object';
  };

  // TODO: call isReadOnly on CaseFields once we make it available
  private isReadonly(case_field: CaseField) {
    return case_field.display_context.toUpperCase() === 'READONLY'
  }
}
