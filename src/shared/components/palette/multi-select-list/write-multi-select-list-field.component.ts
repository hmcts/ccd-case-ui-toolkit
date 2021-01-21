import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormArray, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'ccd-write-multi-select-list-field',
  templateUrl: './write-multi-select-list-field.html'
})
export class WriteMultiSelectListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

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
    this.registerControl(this.checkboxes);
  }

  onCheckChange(event) {

    if (!this.isSelected(event.target.value)) {
      // Add a new control in the FormArray
      this.checkboxes.push(new FormControl(event.target.value));
    } else {
      // Remove the control form the FormArray
      this.checkboxes.controls.forEach((ctrl: FormControl, i) => {
        if (ctrl.value === event.target.value) {
          this.checkboxes.removeAt(i);
          return;
        }
      });
    }
  }

  isSelected(code): AbstractControl {
    if (this.checkboxes && this.checkboxes.controls) {
      return this.checkboxes.controls.find(control => control.value === code);
    } else {
      console.log('no controls');
    }
  }
}
