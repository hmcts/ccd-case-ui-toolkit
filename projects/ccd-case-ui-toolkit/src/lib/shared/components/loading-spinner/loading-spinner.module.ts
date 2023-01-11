import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { LoadingSpinnerComponent } from './loading-spinner.component';

@NgModule({
  imports: [
    CommonModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    LoadingSpinnerComponent
  ],
  exports: [
    LoadingSpinnerComponent
  ],
})
export class LoadingSpinnerModule { }
