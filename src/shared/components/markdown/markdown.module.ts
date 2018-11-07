import { NgModule, ModuleWithProviders } from '@angular/core';
import { MarkdownComponent } from './markdown.component';
import { NgxMdModule } from 'ngx-md';

export const forRoot: ModuleWithProviders = NgxMdModule.forRoot()
@NgModule({
  imports: [
    forRoot
  ],
  declarations: [
    MarkdownComponent
  ],
  exports: [
    MarkdownComponent
  ]
})
export class MarkdownModule {}
