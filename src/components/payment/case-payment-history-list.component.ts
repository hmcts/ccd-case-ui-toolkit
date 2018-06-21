import { Component, Input, OnInit } from '@angular/core';
import { Payment } from './payment.model';
import { CasePaymentHistoryService } from './case-payment-history.service';
import { ContextMap } from './context-map.model';

@Component({
  selector: 'cut-case-payment-history-list',
  templateUrl: 'case-payment-history-list.html',
  styleUrls: ['case-payment-history-list.scss']
})
export class CasePaymentHistoryListComponent implements OnInit {

  @Input()
  public caseViewContext: ContextMap;

  public payments: Payment[];

  constructor(private casePaymentHistoryService: CasePaymentHistoryService) {}

  public ngOnInit(): void {
    let baseUrl = this.caseViewContext.get(ContextMap.PAYMENTS_BASE_URL_KEY);
    let caseReference = this.caseViewContext.get(ContextMap.CASE_REFERENCE_KEY);
    this.casePaymentHistoryService.getPayments(baseUrl, caseReference).subscribe(
      result => {
        this.payments = result;
      }, () => {
        console.log(`An error occurred retrieving payments for caseReference ${caseReference}.`);
      });
  }
}
