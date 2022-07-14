import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { DynamicListPipe } from './dynamic-list.pipe';
import { ReadDynamicListFieldComponent } from './read-dynamic-list-field.component';
import { WriteDynamicListFieldComponent } from './write-dynamic-list-field.component';

@NgModule({
  imports: [
    CommonModule,
    PaletteUtilsModule,
    ReactiveFormsModule,
    MarkdownModule,
    FormsModule
  ],
  declarations: [
    DynamicListPipe,
    ReadDynamicListFieldComponent,
    WriteDynamicListFieldComponent
  ],
  entryComponents: [
    ReadDynamicListFieldComponent,
    WriteDynamicListFieldComponent
  ],
  exports: [
    DynamicListPipe
  ]
})
export class DynamicListModule {}
