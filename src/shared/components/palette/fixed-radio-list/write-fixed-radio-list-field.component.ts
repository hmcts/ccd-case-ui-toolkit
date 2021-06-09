import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-fixed-radio-list-field',
  templateUrl: './write-fixed-radio-list-field.html'
})
export class WriteFixedRadioListFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  fixedRadioListControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.fixedRadioListControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null)) as FormControl;
  }
}
