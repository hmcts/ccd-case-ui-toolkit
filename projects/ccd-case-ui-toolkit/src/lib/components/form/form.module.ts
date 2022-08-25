import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { DateInputComponent } from './date-input/date-input.component';

@NgModule({
  imports: [
    CommonModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    DateInputComponent,
  ],
  exports: [
    DateInputComponent,
  ]
})
export class FormModule {}
