import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ActivityModule } from '../../components/activity';
import { MultipleTasksExistComponent } from './components/multiple-tasks-exist/multiple-tasks-exist.component';
import { NoTasksAvailableComponent } from './components/no-tasks-available/no-tasks-available.component';
import { TaskAssignedComponent } from './components/task-assigned/task-assigned.component';
import { TaskCancelledComponent } from './components/task-cancelled/task-cancelled.component';
import { TaskConflictComponent } from './components/task-conflict/task-conflict.component';
import { TaskUnassignedComponent } from './components/task-unassigned/task-unassigned.component';
import { EventStartGuard } from './event-guard/event-start.guard';
import { EventStartComponent } from './event-start.component';
import { EventTasksResolverService } from './resolvers/event-tasks-resolver.service';
import { EventStartStateMachineService } from './services';

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
    MultipleTasksExistComponent,
    NoTasksAvailableComponent,
    TaskAssignedComponent,
    TaskCancelledComponent,
    TaskConflictComponent,
    TaskUnassignedComponent
  ],
  providers: [
    EventStartGuard,
    EventTasksResolverService,
    EventStartStateMachineService
  ],
  exports: [
    EventStartComponent,
    TaskAssignedComponent,
    TaskUnassignedComponent
  ]
})
export class EventStartModule {}
