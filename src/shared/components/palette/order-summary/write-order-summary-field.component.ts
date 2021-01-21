import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'ccd-write-order-summary-field',
  templateUrl: './write-order-summary-field.html'
})
export class WriteOrderSummaryFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  /*
    These are implemented manually rather than using WriteComplexFieldComponent. The reason
    is because the view is readonly the tree of form controls is not being built automatically
    and has to be built manually.
  */
  ngOnInit(): void {
    let orderSummaryGroup: FormGroup = this.registerControl(new FormGroup({})) as FormGroup;
    let paymentReference: FormControl = new FormControl(this.caseField.value.PaymentReference);
    orderSummaryGroup.addControl('PaymentReference', paymentReference);
    let paymentTotal: FormControl = new FormControl(this.caseField.value.PaymentTotal);
    orderSummaryGroup.addControl('PaymentTotal', paymentTotal);
    let feesArray: FormArray = new FormArray([]);
    this.caseField.value.Fees.forEach((fee) => {
      feesArray.push(this.getFeeValue(fee.value));
    });
    orderSummaryGroup.addControl('Fees', feesArray);
  }

  private getFeeValue(feeValue): FormGroup {
    let feeGroup = new FormGroup({});
    feeGroup.addControl('FeeCode', new FormControl(feeValue.FeeCode));
    feeGroup.addControl('FeeAmount', new FormControl(feeValue.FeeAmount));
    feeGroup.addControl('FeeDescription', new FormControl(feeValue.FeeDescription));
    feeGroup.addControl('FeeVersion', new FormControl(feeValue.FeeVersion));
    let feeValueGroup = new FormGroup({});
    feeValueGroup.addControl('value', feeGroup);
    return feeValueGroup;
  }

}
