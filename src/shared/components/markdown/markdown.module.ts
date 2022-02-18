import { NgModule, ModuleWithProviders } from '@angular/core';
import { MarkdownComponent } from './markdown.component';
import { NgxMdModule } from 'ngx-md';
import { PipesModule } from '../../pipes';

export const forRoot: ModuleWithProviders = NgxMdModule.forRoot()
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
