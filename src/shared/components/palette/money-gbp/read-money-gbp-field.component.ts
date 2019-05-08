import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-money-gbp-field',
  template: `<ng-container *ngIf="isNumber()"><span class="text-16">{{value / 100 | currency:'GBP':'symbol'}}</span></ng-container>`
})
export class ReadMoneyGbpFieldComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  amount: any;
  value: any;

  ngOnInit(): void {
    super.ngOnInit();
    if (this.amount) {
      this.value = this.amount;
    } else if (this.caseField) {
      this.value = this.caseField.value;
    }
  }

  isNumber(): boolean {
    return null !== this.value && !isNaN(this.value);
  }

}
