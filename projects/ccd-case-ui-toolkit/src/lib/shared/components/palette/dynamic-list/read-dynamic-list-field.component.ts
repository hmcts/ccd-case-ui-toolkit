import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-dynamic-list-field',
  template: '<span class="text-16">{{caseField.value | ccdDynamicList:caseField.list_items}}</span>',
})
export class ReadDynamicListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public ngOnInit(): void {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }
    super.ngOnInit();
  }
}
