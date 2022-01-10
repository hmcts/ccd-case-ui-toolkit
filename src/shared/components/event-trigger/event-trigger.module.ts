import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EventTriggerComponent } from './event-trigger.component';
import { ActivityModule } from '../activity';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
  ],
  declarations: [
    EventTriggerComponent
  ],
  exports: [
    EventTriggerComponent
  ]
})
export class EventTriggerModule {}
