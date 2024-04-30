import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { PipesModule } from '../../../pipes';
import { MarkdownComponent } from './markdown.component';

@NgModule({
  declarations: [
    MarkdownComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RpxTranslationModule.forChild(),
    PipesModule,
    MarkdownModule.forRoot()
  ],
  exports: [
    MarkdownComponent
  ],
})
export class MarkdownComponentModule {}
