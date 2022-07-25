import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { ReadMoneyGbpFieldComponent } from './read-money-gbp-field.component';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';

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
  exports: [
    ReadMoneyGbpFieldComponent
  ]
})
export class MoneyGbpModule {}
