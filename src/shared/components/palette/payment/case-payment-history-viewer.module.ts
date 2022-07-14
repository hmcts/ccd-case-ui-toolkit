import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { PaletteUtilsModule } from '../utils/utils.module';
import { CasePaymentHistoryViewerFieldComponent } from './case-payment-history-viewer-field.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    PaymentLibModule,
  ],
  declarations: [
    CasePaymentHistoryViewerFieldComponent
  ],
  entryComponents: [
    CasePaymentHistoryViewerFieldComponent,
  ]
})
export class CasePaymentHistoryViewerModule {}
