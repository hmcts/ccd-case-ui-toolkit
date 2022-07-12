import { ModuleWithProviders, NgModule } from '@angular/core';
import { NgxMdModule } from 'ngx-md';
import { PipesModule } from '../../pipes';
import { MarkdownComponent } from './markdown.component';

export const forRoot: ModuleWithProviders<MarkdownModule> = NgxMdModule.forRoot()
@NgModule({
  imports: [
    forRoot,
    PipesModule
  ],
  declarations: [
    MarkdownComponent
  ],
  exports: [
    MarkdownComponent
  ]
})
export class MarkdownModule {}
