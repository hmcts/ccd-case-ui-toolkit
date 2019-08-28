import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentUrlPipe } from './document-url.pipe';
import { ReadDocumentFieldComponent } from './read-document-field.component';
import { WriteDocumentFieldComponent } from './write-document-field.component';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils/utils.module';
import { MediaViewerWrapperComponent } from './media-viewer-wrapper.component';
import { MediaViewerModule } from '@hmcts/media-viewer';
import { DocumentRoutingModule } from './document-routing.module';
import { WindowService } from '../../../services/window';

@NgModule({
  imports: [
    CommonModule,
    MarkdownModule,
    PaletteUtilsModule,
    DocumentRoutingModule,
    MediaViewerModule,
  ],
  declarations: [
    DocumentUrlPipe,
    ReadDocumentFieldComponent,
    MediaViewerWrapperComponent,
    WriteDocumentFieldComponent
  ],
  entryComponents: [
    ReadDocumentFieldComponent,
    WriteDocumentFieldComponent,
    MediaViewerWrapperComponent
  ],
  exports: [
    DocumentUrlPipe,
    MediaViewerWrapperComponent
  ],
  providers: [
    WindowService
  ]
})
export class DocumentModule { }
