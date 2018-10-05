import { NgModule } from '@angular/core';
import { CasePaymentHistoryViewerFieldComponent } from './case-payment-history-viewer-field.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { PaymentLibModule } from '@hmcts/ccpay-web-component';

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
