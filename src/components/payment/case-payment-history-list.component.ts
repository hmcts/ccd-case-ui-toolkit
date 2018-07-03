import { Component, Input, OnInit } from '@angular/core';
import { Payment } from './payment.model';
import { CasePaymentHistoryService } from './case-payment-history.service';

@Component({
  selector: 'cut-case-payment-history-list',
  templateUrl: 'case-payment-history-list.html',
  styleUrls: ['case-payment-history-list.scss']
})
export class CasePaymentHistoryListComponent implements OnInit {

  @Input()
  public baseURL: string;
  @Input()
  public caseReference: string;

  public payments: Payment[];

  constructor(private casePaymentHistoryService: CasePaymentHistoryService) {}

  public ngOnInit(): void {
    this.casePaymentHistoryService.getPayments(this.baseURL, this.caseReference).subscribe(
      result => {
        this.payments = result;
      }, () => {
        console.log(`An error occurred retrieving payments for caseReference ${this.caseReference}.`);
      });
  }
}
