import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-dynamic-list-field',
  templateUrl: './write-dynamic-list-field.html'
})
export class WriteDynamicListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  dynamicListControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.dynamicListControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null));
  }
}
