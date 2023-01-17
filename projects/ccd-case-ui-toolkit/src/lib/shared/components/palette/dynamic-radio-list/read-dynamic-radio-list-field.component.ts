import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-dynamic-radio-list-field',
  template: '<span class="text-16">{{caseField.value | ccdDynamicRadioList:caseField.list_items}}</span>',
})
export class ReadDynamicRadioListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public ngOnInit(): void {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    /**
     *
     * Seems formatted_value can also be empty for DynamicRadioList's. Reassigning list_items from value.list_items in that case
     */
    if (!this.caseField.list_items && this.caseField.value && this.caseField.value.list_items) {
      this.caseField.list_items = this.caseField.value.list_items;
    }
  }
}
