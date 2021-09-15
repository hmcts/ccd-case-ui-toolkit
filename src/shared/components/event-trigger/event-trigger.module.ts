import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EventTriggerComponent } from './event-trigger.component';
import { ActivityModule } from '../activity';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { EventStartComponent } from '../event-start/event-start.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
  ],
  declarations: [
    EventTriggerComponent,
    EventStartComponent
  ],
  providers: [
    EventStartGuard
  ],
  exports: [
    EventTriggerComponent
  ]
})
export class EventTriggerModule {}
