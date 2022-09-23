import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-dynamic-multi-select-list-field',
  templateUrl: './read-dynamic-multi-select-list-field.html',
  styleUrls: ['./read-dynamic-multi-select-list-field.component.scss']
})
export class ReadDynamicMultiSelectListFieldComponent extends AbstractFieldReadComponent implements OnInit {

  ngOnInit() {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    /**
     *
     * Reassigning list_items from caseField.value when case field formatted value is empty
     */
    if (!this.caseField.list_items && !this.caseField.formatted_value) {
      this.caseField.list_items = this.caseField.value;
    }

    if (!this.caseField.value && this.caseField.formatted_value && this.caseField.formatted_value.value) {
      this.caseField.value = this.caseField.formatted_value.value;
    }

    super.ngOnInit();
  }
}
