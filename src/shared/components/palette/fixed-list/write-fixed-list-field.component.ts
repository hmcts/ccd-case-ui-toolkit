import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { OrderService } from '../../../services/order';

@Component({
  selector: 'ccd-write-fixed-list-field',
  templateUrl: './write-fixed-list-field.html'
})
export class WriteFixedListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  fixedListControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.fixedListControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null));
    OrderService.sortListItems(this.caseField);
    if (this.hasSanitisedDynamicListData()) {
      this.fixedListControl.setValue(this.caseField.value);
    }
  }

  private hasSanitisedDynamicListData() {
    return this.fixedListControl.value && this.fixedListControl.value.value;
  }
}
