import { NgModule } from '@angular/core';
import { MarkdownComponent } from './markdown.component';
import { NgxMdModule } from 'ngx-md';

@NgModule({
  imports: [
    NgxMdModule.forRoot()
  ],
  declarations: [
    MarkdownComponent
  ],
  exports: [
    MarkdownComponent
  ]
})
export class MarkdownModule {}
