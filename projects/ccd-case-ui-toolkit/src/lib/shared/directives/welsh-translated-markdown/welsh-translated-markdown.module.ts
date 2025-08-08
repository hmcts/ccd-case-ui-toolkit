import { NgModule } from '@angular/core';
import { TranslatedMarkdownDirective } from './welsh-translated-markdown.directive';

@NgModule({
  declarations: [
    TranslatedMarkdownDirective
  ],
  exports: [
    TranslatedMarkdownDirective
  ]
})
export class TranslatedMarkdownModule {}
