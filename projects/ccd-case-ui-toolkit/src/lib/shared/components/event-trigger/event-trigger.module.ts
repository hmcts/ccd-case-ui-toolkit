import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RpxTranslationModule } from 'rpx-xui-translation';
import { ActivityModule } from '../activity';
import { EventTriggerComponent } from './event-trigger.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
    RpxTranslationModule.forChild()
  ],
  declarations: [
    EventTriggerComponent
  ],
  exports: [
    EventTriggerComponent
  ]
})
export class EventTriggerModule {}
