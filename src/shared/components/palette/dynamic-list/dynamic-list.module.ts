import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicListPipe } from './dynamic-list.pipe';
import { ReadDynamicListFieldComponent } from './read-dynamic-list-field.component';
import { WriteDynamicListFieldComponent } from './write-dynamic-list-field.component';
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
