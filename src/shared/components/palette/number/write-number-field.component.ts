import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-number-field',
  templateUrl: './write-number-field.html'
})
export class WriteNumberFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  numberControl: FormControl;

  ngOnInit() {
    this.numberControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  public inputBlur() {
    this.numberControl.markAsUntouched();
  }
}
