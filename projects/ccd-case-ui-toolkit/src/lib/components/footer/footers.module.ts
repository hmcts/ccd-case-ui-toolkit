import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { RpxTranslationModule } from 'rpx-xui-translation';
import { FooterComponent } from './footer.component';

@NgModule({
    imports: [
      CommonModule,
      RpxTranslationModule.forChild()
    ],
    declarations: [FooterComponent],
    exports: [FooterComponent]
})
export class FootersModule {}
