import { NgModule } from '@angular/core';
import { WriteOrderSummaryFieldComponent } from './write-order-summary-field.component';
import { ComplexModule } from '../complex/complex.module';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MoneyGbpModule } from '../money-gbp/money-gbp.module';
import { ReadOrderSummaryFieldComponent } from './read-order-summary-field.component';
import { ReadOrderSummaryRowComponent } from './read-order-summary-row.component';

@NgModule({
  imports: [
    CommonModule,
    ComplexModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    MoneyGbpModule
  ],
  declarations: [
    WriteOrderSummaryFieldComponent,
    ReadOrderSummaryFieldComponent,
    ReadOrderSummaryRowComponent,
  ],
  entryComponents: [
    WriteOrderSummaryFieldComponent,
    ReadOrderSummaryFieldComponent,
    ReadOrderSummaryRowComponent,
  ],
})
export class OrderSummaryModule {}
