import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldsUtils } from './fields.utils';
import { ShowCondition } from '../../directives/conditional-show/domain/conditional-show.model';
import { Wizard, WizardPage, WizardPageField } from '../../components';
import { CaseField } from '../../domain/definition';
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
    });
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
    // Removing the field means that it is *NOT* sent to the CCD backend, which means no changes are made in the data.
    // This is OK *if* the hidden value needs to be retained, i.e. field.retain_hidden_value = true, but the default
    // should be to set it to null and allow it to be sent as such.
    if (field.retain_hidden_value) {
      // Reset the field value and remove its control. This does NOT update it in the CCD backend, since it is just
      // removed from the JSON structure
      if (Array.isArray(field.value)) {
        field.value.splice(0, field.value.length);
      } else if (this.isObject(field.value)) {
        field.value = {};
      } else {
        field.value = '';
      }
      (form.get('data') as FormGroup).removeControl(field.id);
    } else {
      // Set the value of the field's control to null. This DOES update the value in the CCD backend
      const fieldControl = (form.get('data') as FormGroup).get(field.id);
      fieldControl.setValue(null);
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
}
