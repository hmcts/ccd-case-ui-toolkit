import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivityModule } from '../../../shared/components/activity/activity.module';
import { MultipleTasksExistComponent } from './components/multiple-tasks-exist/multiple-tasks-exist.component';
import { NoTasksAvailableComponent } from './components/no-tasks-available/no-tasks-available.component';
import { TaskAssignedComponent } from './components/task-assigned/task-assigned.component';
import { TaskCancelledComponent } from './components/task-cancelled/task-cancelled.component';
import { TaskConflictComponent } from './components/task-conflict/task-conflict.component';
import { TaskUnassignedComponent } from './components/task-unassigned/task-unassigned.component';
import { EventGuard } from './guard/event.guard';
import { EventStartComponent } from './event-start/event-start.component';
import { EventTriggerComponent } from './event-trigger/event-trigger.component';
import { EventTasksResolverService } from './resolvers/event-tasks-resolver.service';
import { EventCompletionStateMachineService, EventStartStateMachineService } from './services';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ActivityModule,
    PortalModule,
    RouterModule
  ],
  declarations: [
    EventStartComponent,
    EventTriggerComponent,
    MultipleTasksExistComponent,
    NoTasksAvailableComponent,
    TaskAssignedComponent,
    TaskCancelledComponent,
    TaskConflictComponent,
    TaskUnassignedComponent
  ],
  providers: [
    EventGuard,
    EventTasksResolverService,
    EventStartStateMachineService,
    EventCompletionStateMachineService
  ],
  exports: [
    EventStartComponent,
    EventTriggerComponent,
    TaskAssignedComponent,
    TaskUnassignedComponent
  ]
})
export class EventManagementModule {}
