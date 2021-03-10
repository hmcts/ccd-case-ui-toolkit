import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';

import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-multi-select-list-field',
  templateUrl: './write-dynamic-multi-select-list-field.html'
})
export class WriteDynamicMultiSelectListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  checkboxes: FormArray;

  ngOnInit(): void {
    this.checkboxes = new FormArray([]);

    // Initialise array with existing values
    if (this.caseField.value && Array.isArray(this.caseField.value)) {
      const values: string[] = this.caseField.value;
      values.forEach(value => {
        this.checkboxes.push(new FormControl(value));
      });
    }
    this.registerControl(this.checkboxes, true);
  }

  onCheckChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (!target) return;

    if (!this.isSelected(target.value)) {
      // Add a new control in the FormArray
      this.checkboxes.push(new FormControl(target.value));
    } else {
      // Remove the control from the FormArray
      this.checkboxes.controls.forEach((ctrl: FormControl, i) => {
        if (ctrl.value === target.value) {
          this.checkboxes.removeAt(i);
          return;
        }
      });
    }
  }

  isSelected(code: string): AbstractControl {
    if (this.checkboxes && this.checkboxes.controls) {
      return this.checkboxes.controls.find(control => control.value === code);
    }
  }

  buildElementId(name: string): string {
    return `${this.id()}-${name}`;
  }
}
