import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-multi-select-list-field',
  templateUrl: './write-dynamic-multi-select-list-field.html',
  styleUrls: ['./write-dynamic-multi-select-list-field.component.scss']
})
export class WriteDynamicMultiSelectListFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  public checkboxes: FormArray;
  public dynamicListFormControl: FormControl;

  public ngOnInit(): void {
    this.checkboxes = new FormArray([]);

    this.setInitialCaseList();
    this.setInitialCaseFieldValue();

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

  public onCheckChange(event: Event) {
    const target = event.target as HTMLInputElement;

    if (!target || !target.value) {
      return;
    }

    const selectedListItem: object = this.getValueListItem(target.value);

    if (!this.isSelected(target.value)) {
      // Add a new control in the FormArray
      this.checkboxes.push(new FormControl(selectedListItem));
    } else {
      // Remove the control from the FormArray
      this.checkboxes.controls.forEach((ctrl: FormControl, i) => {
        if (ctrl.value.code === target.value) {
          this.checkboxes.removeAt(i);
        }
      });
    }

    this.dynamicListFormControl.setValue(this.checkboxes.value);
  }

  public isSelected(code: string): AbstractControl {
    if (this.checkboxes && this.checkboxes.controls) {
      return this.checkboxes.controls.find(control => control.value.code === code);
    }
  }

  private getValueListItem(value: string) {
    return this.caseField.list_items.find(i => i.code === value);
  }

  private setInitialCaseList(): void {
    const hasListItems = this.caseField.list_items && this.caseField.list_items.length > 0;
    const hasFormattedListItems = this.caseField.formatted_value && this.caseField.formatted_value.list_items.length > 0;

    if (!hasListItems && hasFormattedListItems) {
      this.caseField.list_items = this.caseField.formatted_value.list_items;
    }
  }

  private setInitialCaseFieldValue(): void {
    if (!this.caseField.value && this.caseField.formatted_value && this.caseField.formatted_value.value) {
      this.caseField.value = this.caseField.formatted_value.value;
    }

    const isNull = this.caseField.value === undefined || this.caseField.value === '';

    if (isNull || !Array.isArray(this.caseField.value)) {
      this.caseField.value = [];
    }
  }
}
