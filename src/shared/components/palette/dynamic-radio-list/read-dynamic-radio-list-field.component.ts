import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-read-dynamic-radio-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedRadioList:caseField.field_type.fixed_list_items}}</span>',
})
export class ReadDynamicRadioListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  ngOnInit() {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }
  }
}
