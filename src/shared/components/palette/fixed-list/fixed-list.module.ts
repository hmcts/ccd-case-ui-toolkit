import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { FixedListPipe } from './fixed-list.pipe';
import { ReadFixedListFieldComponent } from './read-fixed-list-field.component';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';

@NgModule({
  imports: [
    CommonModule,
    PaletteUtilsModule,
    ReactiveFormsModule,
    MarkdownModule,
    FormsModule
  ],
  declarations: [
    FixedListPipe,
    ReadFixedListFieldComponent,
    WriteFixedListFieldComponent
  ],
  entryComponents: [
    ReadFixedListFieldComponent,
    WriteFixedListFieldComponent
  ],
  exports: [
    FixedListPipe
  ]
})
export class FixedListModule {}
