import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadMoneyGbpFieldComponent } from './read-money-gbp-field.component';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { MarkdownModule } from '../../markdown/markdown.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    MarkdownModule
  ],
  declarations: [
    ReadMoneyGbpFieldComponent,
    WriteMoneyGbpFieldComponent,
    MoneyGbpInputComponent
  ],
  entryComponents: [
    ReadMoneyGbpFieldComponent,
    WriteMoneyGbpFieldComponent
  ],
  exports: [
    ReadMoneyGbpFieldComponent
  ]
})
export class MoneyGbpModule {}
