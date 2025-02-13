import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { PipesModule } from '../../../pipes';
import { MarkdownComponent } from './markdown.component';
import { RouterLinkComponent } from './routerlink.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    MarkdownComponent,
    RouterLinkComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RpxTranslationModule.forChild(),
    PipesModule,
    MarkdownModule.forRoot(),
    RouterModule
  ],
  exports: [
    MarkdownComponent,
    RouterLinkComponent
  ],
})
export class MarkdownComponentModule {}
