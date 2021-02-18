import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { WriteDynamicListFieldComponent } from './write-dynamic-list-field.component';
import { ReadDynamicListFieldComponent } from './read-dynamic-list-field.component';
import { DynamicListPipe } from './dynamic-list.pipe';

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