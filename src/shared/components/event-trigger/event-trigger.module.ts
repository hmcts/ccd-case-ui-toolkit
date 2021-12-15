import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EventTriggerComponent } from './event-trigger.component';
import { ActivityModule } from '../activity';
import { EventStartGuard } from '../event-guard/event-start.guard';
import { TaskAssignedComponent } from './components/task-assigned/task-assigned.component';
import { NoTasksAvailableComponent } from './components/no-tasks-available/no-tasks-available.component';
import { MultipleTasksExistComponent } from './components/multiple-tasks-exist/multiple-tasks-exist.component';
import { TaskCancelledComponent } from './components/task-cancelled/task-cancelled.component';
import { TaskConflictComponent } from './components/task-conflict/task-conflict.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
    RouterModule,
  ],
  declarations: [
    EventTriggerComponent,
    TaskAssignedComponent,
    NoTasksAvailableComponent,
    MultipleTasksExistComponent,
    TaskCancelledComponent,
    TaskConflictComponent
  ],
  providers: [
    EventStartGuard
  ],
  exports: [
    EventTriggerComponent,
    TaskAssignedComponent
  ]
})
export class EventTriggerModule {
}
