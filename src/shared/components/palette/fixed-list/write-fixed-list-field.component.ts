import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-fixed-list-field',
  templateUrl: './write-fixed-list-field.html'
})
export class WriteFixedListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  fixedListControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.fixedListControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null));
    this.sortListItems();
    if (this.hasSanitisedDynamicListData()) {
      this.fixedListControl.setValue(this.caseField.value);
    }
  }

  private hasSanitisedDynamicListData() {
    return this.fixedListControl.value && this.fixedListControl.value.value;
  }

  private sortListItems() {
    if (this.hasADefinedDisplayOrder()) {
      this.caseField.list_items.sort( (param1, param2) => {
        if (param1 > param2) { return -1; }
        if ( param1  < param2) { return 1; }
        return 0;
      });
    } else {
      this.caseField.list_items.reverse();
    }
  }

  private hasADefinedDisplayOrder(): boolean {
    const isDifferentToNull = function (element) { return (element.order !== null); }
    return this.caseField.list_items.every(isDifferentToNull);
  }
}
