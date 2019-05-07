import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component } from '@angular/core';

@Component({
  selector: 'ccd-read-fixed-list-field',
  template: '<span class="text-16">{{getValue() | ccdFixedList: getLists()}}</span>',
})
export class ReadFixedListFieldComponent extends AbstractFieldReadComponent {

  getValue() {
    if (this.caseField.field_type.type === 'DynamicList') {
      return this.caseField.value ? this.caseField.value.value.code : '';
    } else {
      return this.caseField.value;
    }
  }

  getLists() {
    if (this.caseField.field_type.type === 'DynamicList') {
      return this.caseField.value ? this.caseField.value.list_items : [];
    } else {
      return this.caseField.field_type.fixed_list_items;
    }
  }
}
