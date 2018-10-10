import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FixedListPipe } from './fixed-list.pipe';
import { ReadFixedListFieldComponent } from './read-fixed-list-field.component';
import { WriteFixedListFieldComponent } from './write-fixed-list-field.component';
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
