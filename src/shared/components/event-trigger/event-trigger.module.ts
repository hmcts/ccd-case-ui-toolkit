import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EventTriggerComponent } from './event-trigger.component';
import { ActivityModule } from '../activity';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { RouterModule } from '@angular/router';
import { WorkAllocationService } from '../case-editor';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ActivityModule,
  ],
  declarations: [
    EventTriggerComponent
  ],
  providers: [
    EventStartGuard,
    WorkAllocationService
  ],
  exports: [
    EventTriggerComponent
  ]
})
export class EventTriggerModule {}
