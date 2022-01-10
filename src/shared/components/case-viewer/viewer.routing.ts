import { Routes } from '@angular/router';
import { editorRouting } from '../case-editor';
import { CaseHistoryComponent } from '../case-history';
import {
  EventStartComponent,
  MultipleTasksExistComponent,
  NoTasksAvailableComponent,
  TaskAssignedComponent,
  TaskCancelledComponent,
  TaskConflictComponent,
  TaskUnassignedComponent
} from '../event-start';
import { EventStartGuard } from '../event-start/event-guard/event-start.guard';
import { EventTasksResolverService } from '../event-start/resolvers/event-tasks-resolver.service';
import { FileUploadProgressGuard } from '../palette/document/file-upload-progress.guard';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request';
import { CaseChallengedAccessSuccessComponent } from './case-challenged-access-success';
import { CaseEventTriggerComponent } from './case-event-trigger';
import { CaseReviewSpecificAccessRejectComponent } from './case-review-specific-access-reject';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request';
import { CasePrinterComponent } from './printer';
import { EventTriggerResolver } from './services';

export const viewerRouting: Routes = [
  {
    path: 'print',
    component: CasePrinterComponent,
  },
  {
    path: 'trigger/:eid',
    resolve: {
      eventTrigger: EventTriggerResolver,
    },
    component: CaseEventTriggerComponent,
    children: editorRouting,
    canActivate: [EventStartGuard],
    canDeactivate: [FileUploadProgressGuard],
  },
  // {
  //   path: 'trigger/:eid/task/:tid',
  //   resolve: {
  //     eventTrigger: EventTriggerResolver,
  //   },
  //   component: CaseEventTriggerComponent,
  //   children: editorRouting,
  //   canActivate: [EventStartGuard],
  //   canDeactivate: [FileUploadProgressGuard],
  // },
  {
    path: 'event-start',
    component: EventStartComponent,
    resolve: {
      tasks: EventTasksResolverService
    }
  },
  {
    path: 'task-assigned',
    component: TaskAssignedComponent
  },
  {
    path: 'task-unassigned',
    component: TaskUnassignedComponent
  },
  {
    path: 'multiple-tasks-exist',
    component: MultipleTasksExistComponent
  },
  {
    path: 'no-tasks-available',
    component: NoTasksAvailableComponent
  },
  {
    path: 'task-cancelled',
    component: TaskCancelledComponent
  },
  {
    path: 'task-conflict',
    component: TaskConflictComponent
  },
  {
    path: 'event/:eid/history',
    component: CaseHistoryComponent,
  },
  {
    path: 'access-request',
    component: CaseChallengedAccessRequestComponent
  },
  {
    path: 'event/:eid/history',
    component: CaseHistoryComponent,
  },
  {
    path: 'challenged-access-request',
    children: [
      {
        path: '',
        component: CaseChallengedAccessRequestComponent,
        data: {
          title: 'Request Challenged Access',
        },
        pathMatch: 'full',
      },
      {
        path: 'success',
        component: CaseChallengedAccessSuccessComponent,
        data: {
          title: 'Challenged Access Success',
        },
      },
    ],
  },
  {
    path: 'specific-access-request',
    children: [
      {
        path: '',
        component: CaseSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access',
        },
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'review-specific-access-request',
    children: [
      {
        path: '',
        component: CaseReviewSpecificAccessRequestComponent,
        data: {
          title: 'Request Specific Access',
        },
        pathMatch: 'full',
      },
      {
        path: 'rejected',
        component: CaseReviewSpecificAccessRejectComponent,
        data: {
          title: 'Review Access Rejected'
        }
      }
    ],
  },
];
