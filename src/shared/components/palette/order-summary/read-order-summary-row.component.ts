import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { FeeValue } from './fee-value.model';

@Component({
  // tslint:disable-next-line
  selector: '[ccdReadOrderSummaryRow]',
  templateUrl: './read-order-summary-row.html',
  styleUrls: [
    './read-order-summary-row.scss'
  ],
})
export class ReadOrderSummaryRowComponent extends AbstractFieldReadComponent implements OnInit {

  @Input()
  feeValue: FeeValue;

  ngOnInit() {
    // We don't want to register this if we don't have a caseField
    if (this.caseField) {
      super.ngOnInit();
    }
  }

  getFeeAmount(): string {
    return this.feeValue.value ? this.feeValue.value.FeeAmount : '';
  }
}
