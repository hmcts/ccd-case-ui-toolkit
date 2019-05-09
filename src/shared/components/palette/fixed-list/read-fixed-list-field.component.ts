import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '<span class="text-16">{{caseField.getValue() | ccdFixedList:caseField.getItems()}}</span>',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  /**
   * THIS METHOD WILL NEED TO BE REMOVED AS REFACTORING OF
   * https://tools.hmcts.net/jira/browse/RDM-4704
   *
   */
  ngOnInit() {
    if (this.caseField) {
      var cf = new CaseField();
      cf.field_type = this.caseField.field_type;
      cf.id = this.caseField.id;
      cf.display_context_parameter = this.caseField.display_context_parameter;
      cf.hidden = this.caseField.hidden;
      cf.label = this.caseField.label;
      cf.order = this.caseField.order;
      cf.field_type = this.caseField.field_type;
      cf.value = this.caseField.value;
      cf.hint_text = this.caseField.hint_text;
      cf.security_label = this.caseField.security_label;
      cf.display_context = this.caseField.display_context;
      cf.display_context_parameter = this.caseField.display_context_parameter;
      cf.show_condition = this.caseField.show_condition;
      cf.show_summary_change_option = this.caseField.show_summary_change_option;
      cf.show_summary_content_option = this.caseField.show_summary_content_option;
      cf.acls = this.caseField.acls;
      cf.wizardProps = this.caseField.wizardProps;
      this.caseField = cf;
    }
  }
}
