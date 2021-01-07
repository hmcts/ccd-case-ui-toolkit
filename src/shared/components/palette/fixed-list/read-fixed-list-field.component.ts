import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '<span class="text-16">{{caseField.value | ccdFixedList:caseField.list_items}}</span>',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  ngOnInit() {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty for DynamicList's
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

  }
}
