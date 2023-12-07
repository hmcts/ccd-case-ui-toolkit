import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-radio-list-field',
  templateUrl: './write-dynamic-radio-list-field.html'
})
export class WriteDynamicRadioListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public dynamicRadioListControl: FormControl;

  public ngOnInit(): void {
    /**
     *
     * Reassigning list_items from formatted_list when list_items is empty
     */
    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    if (!this.caseField.value && this.caseField.formatted_value && this.caseField.formatted_value.value) {
      this.caseField.value = this.caseField.formatted_value.value.code;
    }

    const isNull: boolean = this.caseField.value === undefined || this.caseField.value === '';

    if (isNull || typeof this.caseField.value === 'object') {
      this.caseField.value = [];
    }

    this.dynamicRadioListControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
    this.dynamicRadioListControl.setValue(this.caseField.value);
  }

  public createElementId(name: string): string {
    return this.parent && this.parent.value ? this.parent.value.id + this.parent.value.value : super.createElementId(name);
  }
}
