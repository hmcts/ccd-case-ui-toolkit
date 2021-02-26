import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-text-field',
  templateUrl: './write-text-field.html'
})
export class WriteTextFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  textControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.textControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null)) as FormControl;
    if (this.textControl.disabled) {
      this.textControl.enable({emitEvent: false});
    }
  }
}
