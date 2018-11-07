import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedListModule } from '../fixed-list/fixed-list.module';
import { ReadMultiSelectListFieldComponent } from './read-multi-select-list-field.component';
import { WriteMultiSelectListFieldComponent } from './write-multi-select-list-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MarkdownModule } from '../../markdown/markdown.module';

@NgModule({
  imports: [
    CommonModule,
    FixedListModule,
    ReactiveFormsModule,
    PaletteUtilsModule,
    MarkdownModule
  ],
  declarations: [
    ReadMultiSelectListFieldComponent,
    WriteMultiSelectListFieldComponent
  ],
  entryComponents: [
    ReadMultiSelectListFieldComponent,
    WriteMultiSelectListFieldComponent
  ]
})
export class MultiSelectListModule {}
