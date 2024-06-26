import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { ActivityModule } from '../activity';
import { ErrorMessageComponent } from './error-message.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ActivityModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    ErrorMessageComponent
  ],
  exports: [
    ErrorMessageComponent
  ]
})
export class EventMessageModule {}
