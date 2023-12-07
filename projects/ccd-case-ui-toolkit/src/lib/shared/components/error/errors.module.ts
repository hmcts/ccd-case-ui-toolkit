import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { CallbackErrorsComponent } from './callback-errors.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    CallbackErrorsComponent
  ],
  exports: [
    CallbackErrorsComponent,
  ]
})
export class ErrorsModule {}
