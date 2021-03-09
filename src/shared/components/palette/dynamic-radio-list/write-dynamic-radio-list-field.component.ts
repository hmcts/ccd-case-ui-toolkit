import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-radio-list-field',
  templateUrl: './write-dynamic-radio-list-field.html'
})
export class WriteDynamicRadioListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  dynamicRadioListControl: FormControl;

  ngOnInit() {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    let isNull = this.caseField.value === undefined || this.caseField.value === '';

    if (isNull || typeof this.caseField.value === 'object') {
      this.caseField.value = null;
    }

    this.dynamicRadioListControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
    this.dynamicRadioListControl.setValue(this.caseField.value);
  }

  buildElementId(name: string): string {
    return `${this.id}-${name}`;
  }
}
