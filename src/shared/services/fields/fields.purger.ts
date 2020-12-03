import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FieldsUtils } from './fields.utils';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { WizardPage } from '../../components';
import { CaseField } from '../../domain/definition';

// @dynamic
@Injectable()
export class FieldsPurger {

  constructor(
    private fieldsUtils: FieldsUtils,
  ) {}

  clearHiddenFields(form, wizard, eventTrigger, currentPageId) {
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

  private clearHiddenFieldForFieldShowCondition(currentPageId, form, wizard, eventTrigger) {
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

  private isHidden(condition, formFields) {
    return !condition.match(formFields);
  }

  private findCaseFieldByWizardPageFieldId(currentPage, wizardPageField) {
    return currentPage.case_fields.find(cf => cf.id === wizardPageField.case_field_id);
  }

  private hasShowConditionPage(wizardPage, formFields): boolean {
    return wizardPage.show_condition && formFields[this.getShowConditionKey(wizardPage.show_condition)];
  }

  private hasShowConditionField(case_field, formFields): boolean {
    return case_field.show_condition && formFields.data[this.getShowConditionKey(case_field.show_condition)];
  }

  private getShowConditionKey(show_condition) {
    return show_condition.split('=')[0];
  }

  private resetField(form, field) {
    if (Array.isArray(field.value)) {
      field.value.splice(0, field.value.length);
    } else if (this.isObject(field.value)) {
      field.value = {};
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