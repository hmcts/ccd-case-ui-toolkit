import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { DynamicRadioListPipe } from './dynamic-radio-list.pipe';
import { ReadDynamicRadioListFieldComponent } from './read-dynamic-radio-list-field.component';
import { WriteDynamicRadioListFieldComponent } from './write-dynamic-radio-list-field.component';

@NgModule({
  imports: [
    CommonModule,
    PaletteUtilsModule,
    ReactiveFormsModule,
    MarkdownModule
  ],
  declarations: [
    DynamicRadioListPipe,
    ReadDynamicRadioListFieldComponent,
    WriteDynamicRadioListFieldComponent
  ],
  entryComponents: [
    ReadDynamicRadioListFieldComponent,
    WriteDynamicRadioListFieldComponent
  ],
  exports: [
    DynamicRadioListPipe
  ]
})
export class DynamicRadioListModule { }
