import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedRadioListPipe } from './fixed-radio-list.pipe';
import { ReadFixedRadioListFieldComponent } from './read-fixed-radio-list-field.component';
import { WriteFixedRadioListFieldComponent } from './write-fixed-radio-list-field.component';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';

@NgModule({
  imports: [
    CommonModule,
    PaletteUtilsModule,
    ReactiveFormsModule,
    MarkdownModule
  ],
  declarations: [
    FixedRadioListPipe,
    ReadFixedRadioListFieldComponent,
    WriteFixedRadioListFieldComponent
  ],
  entryComponents: [
    ReadFixedRadioListFieldComponent,
    WriteFixedRadioListFieldComponent
  ],
  exports: [
    FixedRadioListPipe
  ]
})
export class FixedRadioListModule { }
