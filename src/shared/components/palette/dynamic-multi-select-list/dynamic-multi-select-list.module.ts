import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedListModule } from '../fixed-list/fixed-list.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MarkdownModule } from '../../markdown/markdown.module';
import { ReadDynamicMultiSelectListFieldComponent } from './read-dynamic-multi-select-list-field.component';
import { WriteDynamicMultiSelectListFieldComponent } from './write-dynamic-multi-select-list-field.component';

@NgModule({
  imports: [
    CommonModule,
    FixedListModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    MarkdownModule
  ],
  declarations: [
    ReadDynamicMultiSelectListFieldComponent,
    WriteDynamicMultiSelectListFieldComponent
  ],
  entryComponents: [
    ReadDynamicMultiSelectListFieldComponent,
    WriteDynamicMultiSelectListFieldComponent
  ]
})
export class DynamicMultiSelectListModule {}
