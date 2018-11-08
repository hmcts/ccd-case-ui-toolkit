import { Component, Input } from '@angular/core';
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
export class ReadOrderSummaryRowComponent extends AbstractFieldReadComponent {

  @Input()
  feeValue: FeeValue;

  getFeeAmount(): string {
    return this.feeValue.value ? this.feeValue.value.FeeAmount : '';
  }
}
