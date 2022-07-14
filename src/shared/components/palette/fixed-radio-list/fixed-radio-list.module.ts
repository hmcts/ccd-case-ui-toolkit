import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { FixedRadioListPipe } from './fixed-radio-list.pipe';
import { ReadFixedRadioListFieldComponent } from './read-fixed-radio-list-field.component';
import { WriteFixedRadioListFieldComponent } from './write-fixed-radio-list-field.component';

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
