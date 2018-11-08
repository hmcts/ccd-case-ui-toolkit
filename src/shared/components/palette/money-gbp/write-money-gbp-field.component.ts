import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-money-gbp-field',
  templateUrl: './write-money-gbp-field.html'
})
export class WriteMoneyGbpFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  moneyGbpControl: FormControl;

  ngOnInit() {
    this.moneyGbpControl = this.registerControl(new FormControl(this.caseField.value));
  }
}
