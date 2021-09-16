import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EventTriggerComponent } from './event-trigger.component';
import { ActivityModule } from '../activity';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { EventStartComponentModule } from '../event-start/event-start-component.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
    EventStartComponentModule
  ],
  declarations: [
    EventTriggerComponent
  ],
  providers: [
    EventStartGuard
  ],
  exports: [
    EventTriggerComponent
  ]
})
export class EventTriggerModule {}
