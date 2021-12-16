import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivityModule } from '..';
import { ComponentPortalExample1Component } from './component-portal-example1/component-portal-example1.component';
import { ComponentPortalExample2Component } from './component-portal-example2/component-portal-example2.component';
import { MultipleTasksExistComponent } from './components/multiple-tasks-exist/multiple-tasks-exist.component';
import { NoTasksAvailableComponent } from './components/no-tasks-available/no-tasks-available.component';
import { TaskAssignedComponent } from './components/task-assigned/task-assigned.component';
import { TaskCancelledComponent } from './components/task-cancelled/task-cancelled.component';
import { TaskConflictComponent } from './components/task-conflict/task-conflict.component';
import { EventStartGuard } from './event-guard/event-start.guard';
import { EventStartComponent } from './event-start/event-start.component';
import { EventTriggerComponent } from './event-trigger/event-trigger.component';

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
    ComponentPortalExample1Component,
    ComponentPortalExample2Component
  ],
  providers: [
    EventStartGuard
  ],
  exports: [
    EventStartComponent,
    EventTriggerComponent,
    TaskAssignedComponent
  ]
})
export class EventManagementModule {}
