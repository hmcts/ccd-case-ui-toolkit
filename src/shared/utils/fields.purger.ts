import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldsUtils } from './fields.utils';
import { ShowCondition } from '../conditional-show/conditional-show.model';
import { WizardPage } from '../domain/wizard-page.model';

// @dynamic
@Injectable()
export class FieldsPurger {

  constructor(
    private fieldsUtils: FieldsUtils,
  ) {}

  clearHiddenFields(form, wizard, eventTrigger, currentPageId) {
    this.clearHiddenFieldForFieldShowCondition(currentPageId, form, wizard, eventTrigger);
    this.clearHiddenFieldForPageShowCondition(form, wizard);
  }

  private clearHiddenFieldForPageShowCondition(form, wizard) {
    let formFields = form.getRawValue();
    wizard.pages.forEach(wp => {
      if (this.hasShowConditionPage(wp, formFields)) {
          let condition = new ShowCondition(wp.show_condition);
          if (this.isHidden(condition, formFields)) {
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
          if (this.isHidden(condition, formFields)) {
            this.resetField(form, case_field);
          }
      }
    });
  }

  private isHidden(condition, formFields) {
    return !condition.match(formFields.data);
  }

  private findCaseFieldByWizardPageFieldId(currentPage, wizardPageField) {
    return currentPage.case_fields.find(cf => cf.id === wizardPageField.case_field_id);
  }

  private hasShowConditionPage(wizardPage, formFields): boolean {
    return wizardPage.show_condition && formFields.data[this.getShowConditionKey(wizardPage.show_condition)];
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
}
