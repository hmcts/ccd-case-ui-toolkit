import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { CaseField, FieldType } from '../../../domain/definition';
import { Type } from 'class-transformer';
import { AccessControlList } from '../../../domain/definition/access-control-list.model';
import { WizardPageField } from '../../case-editor/domain';

@Component({
  selector: 'ccd-write-fixed-list-field',
  templateUrl: './write-fixed-list-field.html'
})
export class WriteFixedListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  fixedListControl: FormControl;

  ngOnInit() {
    this.instantiate();
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.fixedListControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null));

  }

  /**
   * THIS METHOD WILL NEED TO BE REMOVED AS REFACTORING OF
   * https://tools.hmcts.net/jira/browse/RDM-4704
   *
   */
  private instantiate(){
    if(this.caseField){
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
