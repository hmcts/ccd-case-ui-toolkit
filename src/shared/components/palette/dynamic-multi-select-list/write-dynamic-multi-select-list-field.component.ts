import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';

import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-multi-select-list-field',
  templateUrl: './write-dynamic-multi-select-list-field.html'
})
export class WriteDynamicMultiSelectListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  checkboxes: FormArray;
  dynamicListFormControl: FormControl;

  ngOnInit(): void {
    this.checkboxes = new FormArray([]);

    if (!this.caseField.list_items && this.caseField.formatted_value && this.caseField.formatted_value.list_items) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }

    if (!this.caseField.value && this.caseField.formatted_value && this.caseField.formatted_value.value) {
      this.caseField.value = this.caseField.formatted_value.value;
    }

    let isNull = this.caseField.value === undefined || this.caseField.value === '';

    if (isNull || !Array.isArray(this.caseField.value)) {
      this.caseField.value = [];
    }

    // Initialise array with existing values
    if (this.caseField.value && Array.isArray(this.caseField.value)) {
      const values = this.caseField.value;

      values.forEach(value => {
        this.checkboxes.push(new FormControl(value));
      });
    }

    this.dynamicListFormControl = this.registerControl(new FormControl(this.checkboxes.value)) as FormControl;
    this.dynamicListFormControl.setValue(this.checkboxes.value);
  }

  onCheckChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.value) return;

    const selectedListItem: object = this.getValueListItem(target.value);

    if (!this.isSelected(target.value)) {
      // Add a new control in the FormArray
      this.checkboxes.push(new FormControl(selectedListItem));
    } else {
      // Remove the control from the FormArray
      this.checkboxes.controls.forEach((ctrl: FormControl, i) => {
        if (ctrl.value.code === target.value) {
          this.checkboxes.removeAt(i);
          return;
        }
      });
    }

    this.dynamicListFormControl.setValue(this.checkboxes.value);
  }

  isSelected(code: string): AbstractControl {
    if (this.checkboxes && this.checkboxes.controls) {
      return this.checkboxes.controls.find(control => control.value.code === code);
    }
  }

  buildElementId(name: string): string {
    return `${this.id()}-${name}`;
  }

  private getValueListItem(value: string) {
    return this.caseField.list_items.find(i => i.code === value);
  }
}
