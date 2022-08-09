import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { DocumentUrlPipe } from './document-url.pipe';
import { ReadDocumentFieldComponent } from './read-document-field.component';
import { WriteDocumentFieldComponent } from './write-document-field.component';
@NgModule({
  imports: [
    CommonModule,
    MarkdownModule,
    PaletteUtilsModule,
  ],
  declarations: [
    DocumentUrlPipe,
    ReadDocumentFieldComponent,
    WriteDocumentFieldComponent
  ],
  exports: [
    DocumentUrlPipe,
  ]
})
export class DocumentModule { }
