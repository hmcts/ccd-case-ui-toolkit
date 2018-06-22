import { NgModule } from '@angular/core';
import { CasePaymentHistoryListComponent } from './case-payment-history-list.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CasePaymentHistoryService } from './case-payment-history.service';
import { HttpService } from '../../services/http.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [
    CasePaymentHistoryService,
    HttpService,
  ],
  declarations: [
    CasePaymentHistoryListComponent,
  ],
  entryComponents: [
    CasePaymentHistoryListComponent,
  ],
  exports: [
    CasePaymentHistoryListComponent,
  ]
})
export class CasePaymentHistoryViewModule {}
