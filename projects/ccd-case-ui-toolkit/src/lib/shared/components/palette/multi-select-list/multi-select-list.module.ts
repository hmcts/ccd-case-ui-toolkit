import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { FixedListModule } from '../fixed-list/fixed-list.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadMultiSelectListFieldComponent } from './read-multi-select-list-field.component';
import { WriteMultiSelectListFieldComponent } from './write-multi-select-list-field.component';

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
  ]
})
export class MultiSelectListModule {}
